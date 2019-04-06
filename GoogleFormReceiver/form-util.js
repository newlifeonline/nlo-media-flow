class FormUtil {
    constructor() { }

    static parse(formData) {
        
        let audioId = formData.audio_file.length > 0 ? 
                            formData.audio_file[0] : '';
        let audioImageId = formData.audio_image_file.length > 0 ? 
                            formData.audio_image_file[0] : '';
        let videoId = formData.video_file.length > 0 ? 
                            formData.video_file[0] : '';
        let videoImageId = formData.video_image_file.length > 0 ? 
                            formData.video_image_file[0] : '';
        return {
            title: formData.title,
            description: formData.description,
            eventDate: formData.event_date,
            googleAudioFileId: audioId,
            googleAudioImageFileId: audioImageId,
            audioId: audioId,
            googleVideoFileId: videoId,
            googleVideoImageFileId: videoImageId,
            tagsCSV: formData.tags.join(',')
        };
    }
}

module.exports = FormUtil;