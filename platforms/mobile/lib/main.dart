import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'dart:ui';
import 'dart:async';
import 'dart:io';
import 'package:spectra_mobile/services/camera_service.dart';
import 'package:spectra_mobile/services/emotion_service.dart';
import 'package:camera/camera.dart';
import 'package:camera_macos/camera_macos.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => SpectraProvider()..init()),
      ],
      child: const SpectraApp(),
    ),
  );
}

class SpectraProvider extends ChangeNotifier {
  final CameraService _cameraService = CameraService();
  final EmotionService _emotionService = EmotionService();
  
  bool _isInitialized = false;
  bool get isInitialized => _isInitialized;
  bool get isMock => _cameraService.useMock;
  bool get isMacOS => Platform.isMacOS;

  String _activeTab = 'LIVE';
  String get activeTab => _activeTab;

  Map<String, double> emotions = {
    'ANGRY': 0.0, 'DISGUST': 0.0, 'FEAR': 0.0, 'HAPPY': 0.0, 
    'NEUTRAL': 0.0, 'SAD': 0.0, 'SURPRISE': 0.0,
  };

  String topEmotion = 'STREAMS_IDLE';
  double topScore = 0.0;
  bool _isInferenceRunning = false;
  bool _aiModelLoaded = false;
  bool get aiModelLoaded => _aiModelLoaded;

  Future<void> init() async {
    try {
      await _cameraService.initialize();
      try {
        await _emotionService.init();
        _aiModelLoaded = true;
      } catch (e) {
        debugPrint('Spectra: AI Model Load Warning: $e');
        _aiModelLoaded = false;
      }
      
      _isInitialized = true;
      notifyListeners();

      if (isMock || !_aiModelLoaded) {
        _startMockLoop();
      } else if (!isMacOS) {
        _startInferenceLoop();
      }
    } catch (e) {
      debugPrint('Spectra: Initialization Error: $e');
    }
  }

  void _startMockLoop() {
    Timer.periodic(const Duration(milliseconds: 1500), (timer) {
      if (_activeTab != 'LIVE') return;
      
      // If AI is not loaded but camera is, we can still show camera but mock data
      final mockData = {
        'ANGRY': 0.05, 'DISGUST': 0.01, 'FEAR': 0.01,
        'HAPPY': 0.8, 'NEUTRAL': 0.1, 'SAD': 0.02, 'SURPRISE': 0.01,
      };
      updateEmotions(mockData);
    });
  }

  void _startInferenceLoop() {
    final controller = _cameraService.controller as CameraController?;
    if (controller == null) return;

    controller.startImageStream((CameraImage image) async {
      if (_isInferenceRunning || !_aiModelLoaded) return;
      _isInferenceRunning = true;

      try {
        final faces = await _cameraService.detectFaces(image);
        if (faces.isNotEmpty) {
          final moodResults = _emotionService.predictFromFrame(image, faceBox: faces.first.boundingBox);
          if (moodResults.isNotEmpty) updateEmotions(moodResults);
        }
      } catch (e) {
        debugPrint('Spectra: Loop Error: $e');
      } finally {
        _isInferenceRunning = false;
      }
    });
  }

  void updateEmotions(Map<String, double> newEmotions) {
    emotions = newEmotions;
    var entries = emotions.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
    topEmotion = entries.first.key;
    topScore = entries.first.value;
    notifyListeners();
  }

  void setActiveTab(String tab) { _activeTab = tab; notifyListeners(); }
}

class SpectraApp extends StatelessWidget {
  const SpectraApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Spectra',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF030303),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
        colorScheme: const ColorScheme.dark(
          primary: Colors.cyan,
          secondary: Colors.cyan,
          surface: Color(0xFF111111),
        ),
      ),
      home: const MainLayout(),
    );
  }
}

class MainLayout extends StatelessWidget {
  const MainLayout({super.key});
  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<SpectraProvider>(context);
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(child: _buildBody(provider)),
            _buildBottomNav(provider),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('SPECTRA', style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: 4)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.cyan.withOpacity(0.5))),
            child: Row(
              children: [
                Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.cyan, shape: BoxShape.circle)),
                const SizedBox(width: 8),
                Text('LIVE_FEED', style: GoogleFonts.jetBrainsMono(fontSize: 10, color: Colors.cyan)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(SpectraProvider provider) {
    if (provider.activeTab == 'LIVE') return const SingleChildScrollView(child: LiveInterface());
    if (provider.activeTab == 'ANALYTICS') return const AnalyticsInterface();
    return Center(child: Text('${provider.activeTab} VIEW (WIP)'));
  }

  Widget _buildBottomNav(SpectraProvider provider) {
    return Container(
      margin: const EdgeInsets.all(24),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: const Color(0xFF111111), borderRadius: BorderRadius.circular(30), border: Border.all(color: Colors.white10)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _navItem(provider, 'LIVE', Icons.radio_button_checked),
          _navItem(provider, 'ANALYTICS', Icons.bar_chart),
          _navItem(provider, 'DOCS', Icons.book),
        ],
      ),
    );
  }

  Widget _navItem(SpectraProvider provider, String tab, IconData icon) {
    final isActive = provider.activeTab == tab;
    return GestureDetector(
      onTap: () => provider.setActiveTab(tab),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(color: isActive ? Colors.cyan.withOpacity(0.1) : Colors.transparent, borderRadius: BorderRadius.circular(20)),
        child: Row(
          children: [
            Icon(icon, color: isActive ? Colors.cyan : Colors.white24, size: 20),
            if (isActive) ...[
              const SizedBox(width: 8),
              Text(tab, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.cyan)),
            ]
          ],
        ),
      ),
    );
  }
}

class LiveInterface extends StatelessWidget {
  const LiveInterface({super.key});
  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<SpectraProvider>(context);
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: AspectRatio(
            aspectRatio: 3/4,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black, 
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: Colors.white10),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(32),
                child: Stack(
                  children: [
                    if (provider.isMacOS)
                      CameraMacOSView(
                        cameraMode: CameraMacOSMode.video,
                        onCameraInizialized: (controller) {
                          debugPrint('Spectra: MacOS Camera Initialized');
                        },
                      )
                    else if (provider.isInitialized && !provider.isMock)
                      CameraPreview(provider._cameraService.controller)
                    else
                      Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.videocam_off_outlined, color: Colors.white10, size: 48),
                            const SizedBox(height: 16),
                            Text('CAMERA_OFFLINE', style: GoogleFonts.jetBrainsMono(color: Colors.white24, fontSize: 12)),
                          ],
                        ),
                      ),
                    
                    Positioned(
                      bottom: 20, left: 20, right: 20,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(color: Colors.black26, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white10)),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('CURRENT_STATE', style: GoogleFonts.jetBrainsMono(fontSize: 10, color: Colors.white54, letterSpacing: 1)),
                                const SizedBox(height: 4),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(provider.topEmotion, style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.cyan)),
                                    if (!provider.aiModelLoaded)
                                      const Icon(Icons.warning_amber_rounded, color: Colors.amber, size: 16),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
        ListView(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 24),
            children: provider.emotions.entries.map((e) => _buildMetric(e.key, e.value)).toList(),
          ),
      ],
    );
  }

  Widget _buildMetric(String label, double val) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween, 
            children: [
              Text(label, style: GoogleFonts.outfit(fontSize: 14, color: Colors.white70)), 
              Text('${(val*100).toInt()}%', style: GoogleFonts.jetBrainsMono(fontSize: 14, color: Colors.cyan))
            ]
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(value: val, minHeight: 6, color: Colors.cyan, backgroundColor: Colors.white12),
          ),
        ],
      ),
    );
  }
}

class AnalyticsInterface extends StatelessWidget {
  const AnalyticsInterface({super.key});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('WEEKLY_TRENDS', style: GoogleFonts.jetBrainsMono(fontSize: 12, color: Colors.white54, letterSpacing: 2)),
          const SizedBox(height: 24),
          AspectRatio(
            aspectRatio: 16/9,
            child: Container(
              decoration: BoxDecoration(color: const Color(0xFF111111), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white10)),
              child: const Center(child: Icon(Icons.show_chart, color: Colors.cyan, size: 48)),
            ),
          ),
          const SizedBox(height: 32),
          Text('TOP_EMOTIONS', style: GoogleFonts.jetBrainsMono(fontSize: 12, color: Colors.white54, letterSpacing: 2)),
          const SizedBox(height: 16),
          _buildTrendRow('HAPPY', '42%', Colors.greenAccent),
          _buildTrendRow('NEUTRAL', '28%', Colors.blueAccent),
          _buildTrendRow('SURPRISE', '15%', Colors.orangeAccent),
        ],
      ),
    );
  }

  Widget _buildTrendRow(String label, String val, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(children: [Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)), const SizedBox(width: 12), Text(label)]),
          Text(val, style: GoogleFonts.jetBrainsMono(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
