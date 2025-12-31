
const fs = require('fs');
const path = require('path');

const modelPath = '/Users/shrvnshms/Proj/Project-Spectra/platforms/web/public/models/model.json';
const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

const weightNamesMapping = [
    'conv2d/kernel', 'conv2d/bias',
    'batch_normalization/gamma', 'batch_normalization/beta', 'batch_normalization/moving_mean', 'batch_normalization/moving_variance',
    'conv2d_1/kernel', 'conv2d_1/bias',
    'batch_normalization_1/gamma', 'batch_normalization_1/beta', 'batch_normalization_1/moving_mean', 'batch_normalization_1/moving_variance',
    'conv2d_2/kernel', 'conv2d_2/bias',
    'batch_normalization_2/gamma', 'batch_normalization_2/beta', 'batch_normalization_2/moving_mean', 'batch_normalization_2/moving_variance',
    'conv2d_3/kernel', 'conv2d_3/bias',
    'batch_normalization_3/gamma', 'batch_normalization_3/beta', 'batch_normalization_3/moving_mean', 'batch_normalization_3/moving_variance',
    'conv2d_4/kernel', 'conv2d_4/bias',
    'batch_normalization_4/gamma', 'batch_normalization_4/beta', 'batch_normalization_4/moving_mean', 'batch_normalization_4/moving_variance',
    'conv2d_5/kernel', 'conv2d_5/bias',
    'batch_normalization_5/gamma', 'batch_normalization_5/beta', 'batch_normalization_5/moving_mean', 'batch_normalization_5/moving_variance',
    'conv2d_6/kernel', 'conv2d_6/bias',
    'batch_normalization_6/gamma', 'batch_normalization_6/beta', 'batch_normalization_6/moving_mean', 'batch_normalization_6/moving_variance',
    'dense/kernel', 'dense/bias',
    'batch_normalization_7/gamma', 'batch_normalization_7/beta', 'batch_normalization_7/moving_mean', 'batch_normalization_7/moving_variance',
    'dense_1/kernel', 'dense_1/bias',
    'batch_normalization_8/gamma', 'batch_normalization_8/beta', 'batch_normalization_8/moving_mean', 'batch_normalization_8/moving_variance',
    'spectra_output/kernel', 'spectra_output/bias'
];

if (model.weightsManifest && model.weightsManifest[0] && model.weightsManifest[0].weights) {
    const weights = model.weightsManifest[0].weights;
    if (weights.length === weightNamesMapping.length) {
        for (let i = 0; i < weights.length; i++) {
            console.log(`Renaming ${weights[i].name} to ${weightNamesMapping[i]}`);
            weights[i].name = weightNamesMapping[i];
        }
        fs.writeFileSync(modelPath, JSON.stringify(model, null, 2));
        console.log('Successfully updated model.json');
    } else {
        console.error(`Weight count mismatch! Manifest: ${weights.length}, Mapping: ${weightNamesMapping.length}`);
    }
} else {
    console.error('Weight manifest not found!');
}
