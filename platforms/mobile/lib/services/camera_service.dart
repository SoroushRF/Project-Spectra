import 'dart:io';
import 'dart:ui';
import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:camera_macos/camera_macos.dart'; // macOS Specific
import 'package:flutter/foundation.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';

class CameraService {
  // Mobile Controller
  CameraController? _mobileController;
  
  // MacOS Controller
  CameraMacOSController? _macController;
  
  bool _isMacOS = Platform.isMacOS;
  bool get isMacOS => _isMacOS;

  final FaceDetector _faceDetector = FaceDetector(
    options: FaceDetectorOptions(
      enableContours: false,
      enableClassification: false,
      performanceMode: FaceDetectorMode.fast,
    ),
  );

  bool _isDetecting = false;
  bool _useMock = false;
  bool get useMock => _useMock;

  dynamic get controller => _isMacOS ? _macController : _mobileController;

  Future<void> initialize() async {
    try {
      if (_isMacOS) {
        // macOS Initialization using dedicated plugin
        // Note: camera_macos uses its own view, we'll initialize it here
      } else {
        // Mobile (iOS/Android) Initialization
        final cameras = await availableCameras();
        if (cameras.isEmpty) {
          _useMock = true;
          return;
        }

        final frontCamera = cameras.firstWhere(
          (camera) => camera.lensDirection == CameraLensDirection.front,
          orElse: () => cameras.first,
        );

        _mobileController = CameraController(
          frontCamera,
          ResolutionPreset.medium,
          enableAudio: false,
          imageFormatGroup: Platform.isAndroid 
              ? ImageFormatGroup.yuv420 
              : ImageFormatGroup.bgra8888,
        );

        await _mobileController!.initialize();
      }
    } catch (e) {
      debugPrint('Spectra: Camera Init Error: $e');
      _useMock = true;
    }
  }

  // Helper for ML Kit face detection (Mobile only)
  Future<List<Face>> detectFaces(CameraImage image) async {
    if (_isDetecting || _useMock || _isMacOS) return [];
    _isDetecting = true;

    try {
      final WriteBuffer allBytes = WriteBuffer();
      for (final Plane plane in image.planes) {
        allBytes.putUint8List(plane.bytes);
      }
      final bytes = allBytes.done().buffer.asUint8List();

      final Size imageSize = Size(image.width.toDouble(), image.height.toDouble());
      
      // Determine rotation based on platform and camera orientation
      InputImageRotation rotation = InputImageRotation.rotation90deg;
      if (Platform.isAndroid) {
        rotation = InputImageRotation.rotation270deg; // Common for front camera on Android
      }
      
      // Determine format
      InputImageFormat format = InputImageFormat.bgra8888;
      if (Platform.isAndroid) {
        format = InputImageFormat.yuv420;
      }

      final metadata = InputImageMetadata(
        size: imageSize,
        rotation: rotation,
        format: format,
        bytesPerRow: image.planes[0].bytesPerRow,
      );

      final inputImage = InputImage.fromBytes(bytes: bytes, metadata: metadata);
      final faces = await _faceDetector.processImage(inputImage);
      
      _isDetecting = false;
      return faces;
    } catch (e) {
      _isDetecting = false;
      return [];
    }
  }

  void dispose() {
    _mobileController?.dispose();
    _faceDetector.close();
  }
}
