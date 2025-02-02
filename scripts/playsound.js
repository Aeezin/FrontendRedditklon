function playSound(sound) {
    const audio = document.getElementById("submit-audio");
    const playButton = document.getElementById("submit");

    playButton.addEventListener("click", () => {
        audio.play()
            .then(() => {
                console.log("Audio played successfully");
            })
            .catch(error => {
                console.log("Error playing audio:", error);
            });
    });
}