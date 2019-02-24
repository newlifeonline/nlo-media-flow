class FormUtil {
    constructor() { }

    static parse(formData) {
        let imageId = formData.image_file.length > 0 ? 
                            formData.image_file[0] : '';
        let audioId = formData.audio_file.length > 0 ? 
                            formData.audio_file[0] : '';
        let videoId = formData.video_file.length > 0 ? 
                            formData.video_file[0] : '';
        return {
            title: formData.title,
            description: formData.description,
            eventDate: formData.event_date,
            googleImageFileId: imageId,
            googleAudioFileId: audioId,
            googleVideoFileId: videoId,
            tags: formData.tags
        };
    }
}

module.exports = FormUtil;