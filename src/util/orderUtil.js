import {shuffle} from 'weighted-shuffle'; // your ide may scream that this is wrong, but it is not

export function getIncorrectPixels(client) {
    const wrong = [];
    var pixelCount = 0;
    var nonWhiteCount = 0;

    const orderReference = client.orderReference.getImageData(0, 0, client.orderReference.canvas.width, client.orderReference.canvas.height);
    const orderPriority = client.orderPriority.getImageData(0, 0, client.orderPriority.canvas.width, client.orderPriority.canvas.height);
    const placeReference = client.placeReference.getImageData(0, 0, client.placeReference.canvas.width, client.placeReference.canvas.height);

    for (let y = 0; y < orderReference.height; y++) {
        for (let x = 0; x < orderReference.width; x++) {
            const i = ((y * orderReference.width) + x) * 4;
            const a = orderReference.data[i + 3];
            if (a === 0) continue;

            pixelCount++;

            const r = orderReference.data[i];
            const g = orderReference.data[i + 1];
            const b = orderReference.data[i + 2];

            const currentR = placeReference.data[i];
            const currentG = placeReference.data[i + 1];
            const currentB = placeReference.data[i + 2];

            // this pixel is right
            if (r === currentR && g === currentG && b === currentB) continue;

            const black = (currentR === 0 && currentG === 0 && currentB === 0);
            if ((r === 255 && g === 255 && b === 255) && !black) nonWhiteCount++;
            //const reset = (((r === 255 && g === 255 && b === 255) && !black));

            let priority = getPriority(orderPriority.data[i], orderPriority.data[i + 1], orderPriority.data[i + 2], orderPriority.data[i + 3]);
            priority += Math.floor(Math.random() * 10_000); // increase randomness
            wrong.push([[x, y, [r, g, b]], priority]);
        }
    }

    console.log(`Pixel count: ${pixelCount}; Wrong pixels: ${wrong.length} (${(100 - (wrong.length / pixelCount * 100)).toFixed(2)}%); Ignoring non-black white pixels: ${(100 - ((wrong.length - nonWhiteCount) / pixelCount * 100)).toFixed(2) }%`);
    return shuffle(wrong, 'desc').map((i) => i[0]);
}

export function getPriority(r, g, b, a) {
    if (a === 0) {
        return 0;
    }

    return (r << 16) + (g << 8) + b;
}
