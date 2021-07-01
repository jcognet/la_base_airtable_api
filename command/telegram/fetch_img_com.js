require('dotenv').config();

const fs = require('fs');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');

const apiId = process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_HASH;

const stringSession = new StringSession(process.env.TELEGRAM_USER_SESSION);
const CHANNEL_COM = -1001345478079;// don't forget the -100 in front of the key

run = async () =>{
    const client = new TelegramClient(stringSession, apiId, apiHash, {})

    await client.connect();
    const result =  await client.invoke(new Api.messages.GetHistory({
        peer:CHANNEL_COM,
        offsetId: 0,
        offsetDate: 0,
        addOffset: 0,
        limit: 10,
        maxId: 0,
        minId: 0,
        hash: 0
    }));

    let images = [];
    result.messages.map((message) => {
        if(message.message !== undefined && message.message !== '') {
            console.log(message.message, new Date(message.date * 1000));
        } else if(message.media !== undefined) {
            console.log('Media', new Date(message.date * 1000));
            let maxSize;
            message.media.photo.sizes.map((size) => {
                if(maxSize === undefined || maxSize.size === undefined || maxSize.size < size.size){
                    maxSize = size;
                }
            });
            images = [...images, message];

        }
    });

    images.map(async (image, i) => {
        await client.downloadMedia(image.media, {sizeType: 'y', start: 0, worker: 4})
            .then((buffer) =>{
                console.log('got buffer');
                let writeStream = fs.createWriteStream(`toto_${i}.jpg`);
                writeStream.write(buffer)
                writeStream.on('finish', () => {
                    console.log('wrote all data to file');
                });
                writeStream.end();
            } );
    });

    //client.disconnect();
}

run();
