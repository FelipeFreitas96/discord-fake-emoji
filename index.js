const express = require('express');
const app = express();
const request = require('request');
const gifResize = require('@gumlet/gif-resize');
const Jimp = require('jimp');

const resizePngImage = async (id) => {
    const image = await Jimp.read(`https://cdn.discordapp.com/emojis/${id}.png`);
    return await image.resize(48, 48).getBufferAsync(Jimp.MIME_PNG);  
}

const resizeGifImage = (id, rotate, colors) => {
    return new Promise((resolve, reject) => {
        request({
            url: `https://cdn.discordapp.com/emojis/${id}.gif`,
            encoding: null,
        }, (err, response, buffer) => {
            if (err) return reject(err);
            gifResize({ width: 48, colors, rotate })(buffer)
                .then(resizedBuffer => {
                    resolve(resizedBuffer);
                });
        });
    });
}

const resizeImageRoute = async (req, res) => {
    try {
        let resizedImage;       
        const discordImageType = req.params.type;
        const discordEmojiId = req.params.id;
        const imageRotation = req.query.r || 0;
        const imageColor = req.query.c || 256;
 
        if (discordImageType === 'gif') {
            resizedImage = await resizeGifImage(discordEmojiId, imageRotation, imageColor);
            res.writeHead(200, ['Content-Type', 'image/gif']);
        } else if (discordImageType === 'png') {
            resizedImage = await resizePngImage(discordEmojiId);
            res.writeHead(200, ['Content-Type', 'image/png']);
        }

        res.end(resizedImage);
    } catch (err) {
        res.status(500);
    }
}

app.get('/:id.:type', resizeImageRoute);
app.listen(80);