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

  // Revised: Process raw camera data directly with ROI optimization
  Map<String, double> predictFromFrame(CameraImage image, {Rect? faceBox}) {
    if (_interpreter == null) return {};

    // 1. Convert only the ROI if faceBox is provided
    img.Image? faceImage;
    if (image.format.group == ImageFormatGroup.yuv420) {
      faceImage = _convertYUV420(image, crop: faceBox);
    } else if (image.format.group == ImageFormatGroup.bgra8888) {
      faceImage = _convertBGRA8888(image, crop: faceBox);
    }

    if (faceImage == null) return {};

    // 2. Preprocess for 48x48 Grayscale Model
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

    // 3. Run Inference
    var output = List<double>.filled(_labels.length, 0.0).reshape([1, _labels.length]);
    _interpreter?.run(input.buffer.asFloat32List().reshape([1, 48, 48, 1]), output);

    // 4. Map results
    Map<String, double> results = {};
    for (int i = 0; i < _labels.length; i++) {
      results[_labels[i]] = output[0][i];
    }

    return results;
  }

  // Camera format conversion helpers with ROI support
  img.Image _convertBGRA8888(CameraImage image, {Rect? crop}) {
    final fullImage = img.Image.fromBytes(
      width: image.width,
      height: image.height,
      bytes: image.planes[0].bytes.buffer,
      order: img.ChannelOrder.bgra,
    );
    
    if (crop == null) return fullImage;
    return img.copyCrop(
      fullImage,
      x: crop.left.toInt(),
      y: crop.top.toInt(),
      width: crop.width.toInt(),
      height: crop.height.toInt(),
    );
  }

  img.Image _convertYUV420(CameraImage image, {Rect? crop}) {
    final int width = image.width;
    final int height = image.height;
    
    int startX = 0;
    int startY = 0;
    int endX = width;
    int endY = height;

    if (crop != null) {
      startX = crop.left.toInt().clamp(0, width - 1);
      startY = crop.top.toInt().clamp(0, height - 1);
      endX = crop.right.toInt().clamp(startX + 1, width);
      endY = crop.bottom.toInt().clamp(startY + 1, height);
    }

    final int cropWidth = endX - startX;
    final int cropHeight = endY - startY;
    final img.Image res = img.Image(width: cropWidth, height: cropHeight);
    
    final yPlane = image.planes[0];
    final int yBytesPerRow = yPlane.bytesPerRow;

    for (int y = 0; y < cropHeight; y++) {
      for (int x = 0; x < cropWidth; x++) {
        final int yIndex = (y + startY) * yBytesPerRow + (x + startX);
        final pixel = yPlane.bytes[yIndex];
        res.setPixelRgb(x, y, pixel, pixel, pixel);
      }
    }
    return res;
  }

  void dispose() {
    _interpreter?.close();
  }
}
