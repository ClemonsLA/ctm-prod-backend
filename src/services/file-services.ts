import FileType from 'file-type';

// =====Allowed image formats=====
const imageTypeList = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/tiff'
]
// =====Allowed music formats=====
const musicTypeList = [
    'audio/mp4',
    'audio/mpeg',
    'audio/opus',
    'audio/mpeg4-generic',
    'audio/ogg'
]

// checking if image file has correct extension(allowed extension are in imageTypeList)
export async function checkImageType(imageBuffer: Buffer): Promise<boolean> {
    try {
        const imageMeta = await FileType.fromBuffer(imageBuffer);
        if (!imageMeta) {
            console.error("Not recognized file type")
            return false
        };

        if (imageTypeList.includes(imageMeta.mime)) return true;

        return false;

    } catch (error) {
        console.error(error);
        throw new Error("Error during checking image type");
    }
}

// checking if image file has correct extension(allowed extension are in musicTypeList)
export async function checkMusicType(musicBuffer: Buffer): Promise<boolean> {
    try {
        const musicMeta = await FileType.fromBuffer(musicBuffer);
        if (!musicMeta) {
            console.error("Not recognized file type")
            return false
        };

        if (musicTypeList.includes(musicMeta.mime)) return true;

        return false;

    } catch (error) {
        console.error(error);
        throw new Error("Error during checking music type");
    }
}