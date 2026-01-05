import 'dart:typed_data';
import 'dart:ui';
import 'package:tflite_flutter/tflite_flutter.dart';
import 'package:image/image.dart' as img;
import 'package:camera/camera.dart';
import 'dart:io';

class EmotionService {
  Interpreter? _interpreter;
  final List<String> _labels = [
    'ANGRY',
    'DISGUST',
    'FEAR',
    'HAPPY',
    'NEUTRAL',
    'SAD',
    'SURPRISE'
  ];

  Future<void> init() async {
    try {
      _interpreter = await Interpreter.fromAsset('assets/spectra_model.tflite');
      _interpreter?.allocateTensors();
    } catch (e) {
      print('Spectra: Model Load Error: $e');
    }
  }

  // New: Process raw camera data directly
  Map<String, double> predictFromFrame(CameraImage image, {Rect? faceBox}) {
    if (_interpreter == null) return {};

    // 1. Convert CameraImage to img.Image (Image package)
    img.Image? fullImage;
    if (image.format.group == ImageFormatGroup.yuv420) {
      fullImage = _convertYUV420(image);
    } else if (image.format.group == ImageFormatGroup.bgra8888) {
      fullImage = _convertBGRA8888(image);
    }

    if (fullImage == null) return {};

    // 2. Crop to face if provided
    img.Image faceImage = fullImage;
    if (faceBox != null) {
      faceImage = img.copyCrop(
        fullImage,
        x: faceBox.left.toInt(),
        y: faceBox.top.toInt(),
        width: faceBox.width.toInt(),
        height: faceBox.height.toInt(),
      );
    }

    // 3. Preprocess for 48x48 Grayscale Model
    img.Image resized = img.copyResize(faceImage, width: 48, height: 48);
    
    // In terms of performance, we use a flattened list for the [1, 48, 48, 1] tensor
    var input = Float32List(1 * 48 * 48 * 1);
    for (int y = 0; y < 48; y++) {
      for (int x = 0; x < 48; x++) {
        var pixel = resized.getPixel(x, y);
        // Luma grayscale conversion
        double gray = (0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b) / 255.0;
        input[y * 48 + x] = gray;
      }
    }

    // 4. Run Inference
    var output = List<double>.filled(_labels.length, 0.0).reshape([1, _labels.length]);
    _interpreter?.run(input.buffer.asFloat32List().reshape([1, 48, 48, 1]), output);

    // 5. Map results
    Map<String, double> results = {};
    for (int i = 0; i < _labels.length; i++) {
      results[_labels[i]] = output[0][i];
    }

    return results;
  }

  // Camera format conversion helpers
  img.Image _convertBGRA8888(CameraImage image) {
    return img.Image.fromBytes(
      width: image.width,
      height: image.height,
      bytes: image.planes[0].bytes.buffer,
      order: img.ChannelOrder.bgra,
    );
  }

  img.Image _convertYUV420(CameraImage image) {
    // Basic conversion for Android YUV formats
    final int width = image.width;
    final int height = image.height;
    final img.Image res = img.Image(width: width, height: height);
    
    // In a real production app, we'd use a faster native YUV converter library, 
    // but this works for proof-of-concept.
    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        final pixel = image.planes[0].bytes[y * width + x];
        res.setPixelRgb(x, y, pixel, pixel, pixel);
      }
    }
    return res;
  }

  void dispose() {
    _interpreter?.close();
  }
}
