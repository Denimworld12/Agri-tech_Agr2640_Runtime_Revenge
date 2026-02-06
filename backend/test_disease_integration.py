"""
Test script for disease detection integration
Run this to verify the CNN model is working correctly
"""

import sys
import os

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

def test_model_loading():
    """Test if the model can be loaded"""
    print("=" * 60)
    print("Testing CNN Model Loading...")
    print("=" * 60)
    
    try:
        from ml_model import load_model
        model = load_model()
        print("✓ Model loaded successfully!")
        print(f"Model type: {type(model)}")
        return True
    except Exception as e:
        print(f"✗ Failed to load model: {e}")
        return False


def test_disease_classes():
    """Test disease class information"""
    print("\n" + "=" * 60)
    print("Disease Classes Available:")
    print("=" * 60)
    
    try:
        from ml_model import CLASS_NAMES, DISEASE_INFO
        
        for i, class_name in enumerate(CLASS_NAMES, 1):
            info = DISEASE_INFO.get(class_name, {})
            print(f"\n{i}. {class_name}")
            print(f"   Name: {info.get('name', 'N/A')}")
            print(f"   Severity: {info.get('severity', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_image_prediction():
    """Test image prediction with a sample"""
    print("\n" + "=" * 60)
    print("Testing Image Prediction...")
    print("=" * 60)
    
    try:
        from ml_model import predict_image
        from PIL import Image
        import io
        import numpy as np
        
        # Create a dummy image (224x224 RGB)
        dummy_image = Image.new('RGB', (224, 224), color=(100, 150, 100))
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        dummy_image.save(img_byte_arr, format='JPEG')
        img_bytes = img_byte_arr.getvalue()
        
        # Test prediction
        result = predict_image(img_bytes)
        
        print("✓ Prediction successful!")
        print(f"\nPrediction Results:")
        print(f"  Disease: {result['disease_name']}")
        print(f"  Confidence: {result['confidence']}%")
        print(f"  Severity: {result['severity']}")
        print(f"  Treatment: {result['treatment'][:100]}...")
        
        return True
    except Exception as e:
        print(f"✗ Prediction failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_service_integration():
    """Test disease detection service"""
    print("\n" + "=" * 60)
    print("Testing Disease Detection Service Integration...")
    print("=" * 60)
    
    try:
        from services.disease_detection_service import DiseaseDetectionService
        from PIL import Image
        import io
        import asyncio
        
        # Create service instance
        service = DiseaseDetectionService()
        
        # Create a dummy image
        dummy_image = Image.new('RGB', (224, 224), color=(150, 100, 100))
        img_byte_arr = io.BytesIO()
        dummy_image.save(img_byte_arr, format='JPEG')
        img_bytes = img_byte_arr.getvalue()
        
        # Test analysis
        async def run_analysis():
            result = await service.analyze_disease(img_bytes, crop_type="sugarcane")
            return result
        
        result = asyncio.run(run_analysis())
        
        if result.get('success'):
            print("✓ Service integration successful!")
            analysis = result['analysis']
            print(f"\nAnalysis Results:")
            print(f"  Analysis ID: {analysis['analysis_id']}")
            print(f"  Crop Type: {analysis['crop_type']}")
            print(f"  Confidence: {analysis['confidence']:.2%}")
            print(f"  Model Available: {analysis.get('model_available', False)}")
            if analysis.get('detected_diseases'):
                disease = analysis['detected_diseases'][0]
                print(f"  Detected: {disease['name']}")
        else:
            print(f"✗ Service test failed: {result.get('error')}")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Service integration failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "Disease Detection Integration Test" + " " * 14 + "║")
    print("╚" + "=" * 58 + "╝")
    
    results = []
    
    # Run tests
    results.append(("Model Loading", test_model_loading()))
    results.append(("Disease Classes", test_disease_classes()))
    results.append(("Image Prediction", test_image_prediction()))
    results.append(("Service Integration", test_service_integration()))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary:")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name:.<40} {status}")
    
    total_passed = sum(1 for _, passed in results if passed)
    total_tests = len(results)
    
    print("\n" + "=" * 60)
    print(f"Total: {total_passed}/{total_tests} tests passed")
    print("=" * 60 + "\n")
    
    return total_passed == total_tests


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
