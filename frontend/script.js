// ============================================================
// CRICKET SHOT RECOGNITION - FRONTEND
// ============================================================

const API_URL = "http://127.0.0.1:8000/predict";


// ============================================================
// WAIT UNTIL HTML IS FULLY LOADED
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Frontend loaded successfully");


    // ========================================================
    // GET ELEMENTS
    // ========================================================

    const videoInput =
        document.getElementById("videoInput");

    const chooseButton =
        document.getElementById("chooseButton");

    const changeVideoButton =
        document.getElementById("changeVideoButton");

    const videoPreview =
        document.getElementById("videoPreview");

    const previewPlaceholder =
        document.getElementById("previewPlaceholder");

    const uploadBox =
        document.getElementById("uploadBox");

    const fileCard =
        document.getElementById("fileCard");

    const selectedFile =
        document.getElementById("selectedFile");

    const fileSize =
        document.getElementById("fileSize");

    const removeButton =
        document.getElementById("removeButton");

    const analyzeButton =
        document.getElementById("analyzeButton");

    const buttonText =
        document.getElementById("buttonText");

    const buttonIcon =
        document.getElementById("buttonIcon");

    const connectionStatus =
        document.getElementById("connectionStatus");


    // ========================================================
    // RESULT ELEMENTS
    // ========================================================

    const prediction =
        document.getElementById("prediction");

    const confidence =
        document.getElementById("confidence");

    const confidenceBar =
        document.getElementById("confidenceBar");


    // ========================================================
    // CHECK ELEMENTS
    // ========================================================

    console.log("videoInput:", videoInput);
    console.log("chooseButton:", chooseButton);
    console.log("changeVideoButton:", changeVideoButton);
    console.log("analyzeButton:", analyzeButton);

    console.log("FastAPI:", API_URL);


    // ========================================================
    // CHOOSE VIDEO
    // ========================================================

    chooseButton.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        console.log("Choose Video clicked");

        videoInput.click();

    });


    // ========================================================
    // CHOOSE ANOTHER VIDEO
    // ========================================================

    changeVideoButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log(
                "Choose Another Video clicked"
            );

            /*
             * Clear the input first.
             *
             * This allows the user to choose the
             * exact same video again if needed.
             */

            videoInput.value = "";

            videoInput.click();

        }
    );


    // ========================================================
    // VIDEO SELECTED
    // ========================================================

    videoInput.addEventListener("change", function (event) {

        event.preventDefault();

        const file = videoInput.files[0];

        if (!file) {
            return;
        }


        console.log("Selected:", file.name);


        // ====================================================
        // CHECK FILE
        // ====================================================

        const validVideo =
            file.type.startsWith("video/") ||
            /\.(mp4|mov|avi|mkv|webm)$/i.test(file.name);


        if (!validVideo) {

            alert("Please select a video file.");

            videoInput.value = "";

            return;
        }


        // ====================================================
        // PREVIEW VIDEO
        // ====================================================

        const videoURL =
            URL.createObjectURL(file);

        videoPreview.src =
            videoURL;

        videoPreview.style.display =
            "block";

        previewPlaceholder.style.display =
            "none";


        // ====================================================
        // SHOW CHOOSE ANOTHER BUTTON
        // ====================================================

        changeVideoButton.style.display =
            "block";


        // ====================================================
        // FILE INFORMATION
        // ====================================================

        selectedFile.textContent =
            file.name;

        fileSize.textContent =
            formatFileSize(file.size);

        fileCard.style.display =
            "flex";


        // ====================================================
        // RESET OLD RESULTS
        // ====================================================

        resetResults();


        connectionStatus.textContent =
            "Video ready for evaluation";

    });


    // ========================================================
    // REMOVE VIDEO
    // ========================================================

    removeButton.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();


        videoInput.value = "";

        videoPreview.pause();

        videoPreview.removeAttribute("src");

        videoPreview.load();

        videoPreview.style.display =
            "none";

        previewPlaceholder.style.display =
            "block";

        fileCard.style.display =
            "none";


        // Hide Choose Another Video button

        changeVideoButton.style.display =
            "none";


        selectedFile.textContent =
            "No video selected";

        fileSize.textContent =
            "--";


        resetResults();


        connectionStatus.textContent =
            "Ready";

    });


    // ========================================================
    // EVALUATE VIDEO
    // ========================================================

    analyzeButton.addEventListener(
        "click",
        async function (event) {

            // VERY IMPORTANT
            // Prevent page reload

            event.preventDefault();
            event.stopPropagation();


            console.log("");
            console.log("================================");
            console.log("EVALUATE BUTTON CLICKED");
            console.log("================================");


            const file =
                videoInput.files[0];


            if (!file) {

                alert(
                    "Please choose a cricket video first."
                );

                return;
            }


            console.log(
                "Sending:",
                file.name
            );


            // =================================================
            // BUTTON LOADING STATE
            // =================================================

            analyzeButton.disabled =
                true;

            buttonText.textContent =
                "Evaluating...";

            buttonIcon.textContent =
                "⏳";


            connectionStatus.textContent =
                "Analyzing video...";


            prediction.textContent =
                "Analyzing...";

            confidence.textContent =
                "--%";

            confidenceBar.style.width =
                "0%";


            // =================================================
            // FORM DATA
            // =================================================

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );


            try {

                console.log(
                    "Connecting to FastAPI..."
                );


                // =================================================
                // SEND REQUEST
                // =================================================

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                console.log(
                    "Response status:",
                    response.status
                );


                // =================================================
                // GET JSON
                // =================================================

                const data =
                    await response.json();


                console.log(
                    "Response from FastAPI:",
                    data
                );


                // =================================================
                // CHECK RESPONSE
                // =================================================

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Prediction failed"
                    );

                }


                // =================================================
                // DISPLAY MAIN PREDICTION
                // =================================================

                prediction.textContent =
                    data.prediction;


                confidence.textContent =
                    `${Number(
                        data.confidence
                    ).toFixed(2)}%`;


                confidenceBar.style.width =
                    `${data.confidence}%`;


                // =================================================
                // DISPLAY TOP 3
                // =================================================

                if (
                    data.top_predictions &&
                    data.top_predictions.length >= 1
                ) {

                    updatePrediction(
                        1,
                        data.top_predictions[0]
                    );

                }


                if (
                    data.top_predictions &&
                    data.top_predictions.length >= 2
                ) {

                    updatePrediction(
                        2,
                        data.top_predictions[1]
                    );

                }


                if (
                    data.top_predictions &&
                    data.top_predictions.length >= 3
                ) {

                    updatePrediction(
                        3,
                        data.top_predictions[2]
                    );

                }


                // =================================================
                // SUCCESS
                // =================================================

                connectionStatus.textContent =
                    "✓ Evaluation complete";


                console.log("");
                console.log(
                    "PREDICTION DISPLAYED:"
                );

                console.log(
                    data.prediction
                );

                console.log(
                    data.confidence + "%"
                );


            } catch (error) {

                console.error(
                    "Frontend prediction error:",
                    error
                );


                prediction.textContent =
                    "Error";


                confidence.textContent =
                    "--%";


                confidenceBar.style.width =
                    "0%";


                connectionStatus.textContent =
                    "✕ Failed to connect to FastAPI";


                alert(
                    "Could not evaluate video.\n\n" +
                    error.message
                );

            } finally {

                // =================================================
                // RESTORE BUTTON
                // =================================================

                analyzeButton.disabled =
                    false;

                buttonText.textContent =
                    "Evaluate Shot";

                buttonIcon.textContent =
                    "✦";

            }

        }
    );


    // ========================================================
    // DRAG & DROP
    // ========================================================

    uploadBox.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadBox.classList.add(
                "dragging"
            );

        }
    );


    uploadBox.addEventListener(
        "dragleave",
        function () {

            uploadBox.classList.remove(
                "dragging"
            );

        }
    );


    uploadBox.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            uploadBox.classList.remove(
                "dragging"
            );


            const file =
                event.dataTransfer.files[0];


            if (!file) {
                return;
            }


            const validVideo =
                file.type.startsWith("video/") ||
                /\.(mp4|mov|avi|mkv|webm)$/i.test(
                    file.name
                );


            if (!validVideo) {

                alert(
                    "Please drop a video file."
                );

                return;
            }


            // Put dropped file into input

            const dataTransfer =
                new DataTransfer();

            dataTransfer.items.add(file);

            videoInput.files =
                dataTransfer.files;


            // Preview

            const videoURL =
                URL.createObjectURL(file);

            videoPreview.src =
                videoURL;

            videoPreview.style.display =
                "block";

            previewPlaceholder.style.display =
                "none";


            // Show another video button

            changeVideoButton.style.display =
                "block";


            selectedFile.textContent =
                file.name;

            fileSize.textContent =
                formatFileSize(file.size);

            fileCard.style.display =
                "flex";


            resetResults();


            connectionStatus.textContent =
                "Video ready for evaluation";

        }
    );


    // ========================================================
    // UPDATE TOP PREDICTION
    // ========================================================

    function updatePrediction(
        number,
        result
    ) {

        if (!result) {
            return;
        }


        const name =
            document.getElementById(
                `top${number}Name`
            );

        const score =
            document.getElementById(
                `top${number}Score`
            );

        const bar =
            document.getElementById(
                `top${number}Bar`
            );


        if (!name || !score || !bar) {

            console.error(
                `Top ${number} elements missing`
            );

            return;
        }


        name.textContent =
            result.shot;


        score.textContent =
            `${Number(
                result.confidence
            ).toFixed(2)}%`;


        bar.style.width =
            `${result.confidence}%`;

    }


    // ========================================================
    // RESET RESULTS
    // ========================================================

    function resetResults() {

        prediction.textContent =
            "—";

        confidence.textContent =
            "--%";

        confidenceBar.style.width =
            "0%";


        updatePrediction(
            1,
            {
                shot: "—",
                confidence: 0
            }
        );


        updatePrediction(
            2,
            {
                shot: "—",
                confidence: 0
            }
        );


        updatePrediction(
            3,
            {
                shot: "—",
                confidence: 0
            }
        );

    }


    // ========================================================
    // FILE SIZE
    // ========================================================

    function formatFileSize(bytes) {

        if (!bytes) {
            return "0 KB";
        }


        const mb =
            bytes / (1024 * 1024);


        if (mb >= 1) {

            return (
                mb.toFixed(2) +
                " MB"
            );

        }


        return (
            (bytes / 1024).toFixed(1) +
            " KB"
        );

    }


    // ========================================================
    // INITIAL STATE
    // ========================================================

    resetResults();


    connectionStatus.textContent =
        "Ready";


    console.log(
        "Frontend ready. No page reload should occur."
    );

});