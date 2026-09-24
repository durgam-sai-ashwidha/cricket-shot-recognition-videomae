// ============================================================
// CRICKET SHOT RECOGNITION
// FRONTEND JAVASCRIPT
// ============================================================


// ============================================================
// FASTAPI ENDPOINT
// ============================================================

const API_URL = "http://127.0.0.1:8000/predict";


// ============================================================
// WAIT FOR PAGE
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("====================================");
    console.log("CRICKET SHOT RECOGNITION");
    console.log("Frontend loaded");
    console.log("API:", API_URL);
    console.log("====================================");


    // ========================================================
    // HTML ELEMENTS
    // ========================================================

    const videoInput =
        document.getElementById("videoInput");

    const chooseButton =
        document.getElementById("chooseButton");

    const uploadBox =
        document.getElementById("uploadBox");

    const previewPlaceholder =
        document.getElementById("previewPlaceholder");

    const videoPreview =
        document.getElementById("videoPreview");

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

    const buttonIcon =
        document.getElementById("buttonIcon");

    const buttonText =
        document.getElementById("buttonText");

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
    // ELEMENT CHECK
    // ========================================================

    if (
        !videoInput ||
        !chooseButton ||
        !uploadBox ||
        !previewPlaceholder ||
        !videoPreview ||
        !fileCard ||
        !selectedFile ||
        !fileSize ||
        !removeButton ||
        !analyzeButton ||
        !buttonIcon ||
        !buttonText ||
        !connectionStatus ||
        !prediction ||
        !confidence ||
        !confidenceBar
    ) {

        console.error(
            "Some HTML elements are missing."
        );

        return;
    }


    console.log(
        "All HTML elements found."
    );



    // ========================================================
    // CHOOSE VIDEO
    // ========================================================

    chooseButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            console.log(
                "Choose Video clicked"
            );

            videoInput.click();

        }
    );



    // ========================================================
    // VIDEO SELECTED
    // ========================================================

    videoInput.addEventListener(
        "change",
        function () {

            const file =
                videoInput.files[0];


            if (!file) {
                return;
            }


            console.log(
                "Selected video:",
                file.name
            );


            // ------------------------------------------------
            // CHECK FILE
            // ------------------------------------------------

            if (
                !file.type.startsWith("video/")
            ) {

                alert(
                    "Please select a video file."
                );

                videoInput.value = "";

                return;
            }


            // ------------------------------------------------
            // SHOW VIDEO
            // ------------------------------------------------

            showVideo(file);


            // ------------------------------------------------
            // SHOW FILE INFORMATION
            // ------------------------------------------------

            selectedFile.textContent =
                file.name;


            fileSize.textContent =
                formatFileSize(file.size);


            fileCard.style.display =
                "flex";


            // ------------------------------------------------
            // RESET PREVIOUS RESULT
            // ------------------------------------------------

            resetResults();


            connectionStatus.textContent =
                "Video ready for evaluation";


            connectionStatus.style.color =
                "rgba(255,255,255,0.5)";

        }
    );



    // ========================================================
    // SHOW VIDEO PREVIEW
    // ========================================================

    function showVideo(file) {

        const videoURL =
            URL.createObjectURL(file);


        videoPreview.src =
            videoURL;


        videoPreview.style.display =
            "block";


        previewPlaceholder.style.display =
            "none";

    }



    // ========================================================
    // REMOVE VIDEO
    // ========================================================

    removeButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            console.log(
                "Removing selected video"
            );


            videoInput.value = "";


            videoPreview.pause();

            videoPreview.removeAttribute(
                "src"
            );

            videoPreview.load();


            videoPreview.style.display =
                "none";


            previewPlaceholder.style.display =
                "block";


            fileCard.style.display =
                "none";


            selectedFile.textContent =
                "No video selected";


            fileSize.textContent =
                "--";


            resetResults();


            connectionStatus.textContent =
                "Ready";

        }
    );



    // ========================================================
    // EVALUATE BUTTON
    // ========================================================

    analyzeButton.addEventListener(
        "click",
        async function (event) {


            // =================================================
            // CRITICAL
            // STOP PAGE RELOAD
            // =================================================

            event.preventDefault();

            event.stopPropagation();


            console.log("");
            console.log(
                "===================================="
            );

            console.log(
                "EVALUATE BUTTON CLICKED"
            );

            console.log(
                "===================================="
            );


            // =================================================
            // GET FILE
            // =================================================

            const file =
                videoInput.files[0];


            if (!file) {

                alert(
                    "Please upload a cricket video first."
                );

                return;
            }


            console.log(
                "Sending video:",
                file.name
            );


            // =================================================
            // LOADING STATE
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



            // =================================================
            // SEND TO FASTAPI
            // =================================================

            try {

                console.log(
                    "Connecting to FastAPI..."
                );


                console.log(
                    "POST",
                    API_URL
                );


                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                console.log(
                    "HTTP status:",
                    response.status
                );


                // =================================================
                // READ JSON
                // =================================================

                const data =
                    await response.json();


                console.log(
                    "FastAPI response:",
                    data
                );


                // =================================================
                // CHECK RESPONSE
                // =================================================

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Prediction failed."
                    );

                }



                // =================================================
                // DISPLAY MAIN RESULT
                // =================================================

                prediction.textContent =
                    data.prediction;


                confidence.textContent =
                    `${data.confidence}%`;


                confidenceBar.style.width =
                    `${data.confidence}%`;



                // =================================================
                // DISPLAY TOP 3
                // =================================================

                if (
                    data.top_predictions &&
                    data.top_predictions.length > 0
                ) {

                    updatePrediction(
                        1,
                        data.top_predictions[0]
                    );


                    updatePrediction(
                        2,
                        data.top_predictions[1]
                    );


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


                connectionStatus.style.color =
                    "#78ff9b";


                console.log("");
                console.log(
                    "===================================="
                );

                console.log(
                    "PREDICTION DISPLAYED"
                );

                console.log(
                    "Shot:",
                    data.prediction
                );

                console.log(
                    "Confidence:",
                    data.confidence + "%"
                );

                console.log(
                    "===================================="
                );


            } catch (error) {


                // =================================================
                // ERROR
                // =================================================

                console.error(
                    "Prediction error:",
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


                connectionStatus.style.color =
                    "#ff7777";


                alert(
                    "Could not evaluate video.\n\n" +
                    error.message
                );

            }


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
    );



    // ========================================================
    // DRAG OVER
    // ========================================================

    uploadBox.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            uploadBox.classList.add(
                "dragging"
            );

        }
    );



    // ========================================================
    // DRAG LEAVE
    // ========================================================

    uploadBox.addEventListener(
        "dragleave",
        function () {

            uploadBox.classList.remove(
                "dragging"
            );

        }
    );



    // ========================================================
    // DROP
    // ========================================================

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


            if (
                !file.type.startsWith("video/")
            ) {

                alert(
                    "Please drop a video file."
                );

                return;
            }


            console.log(
                "Dropped video:",
                file.name
            );


            // ------------------------------------------------
            // Put file into input
            // ------------------------------------------------

            const dataTransfer =
                new DataTransfer();


            dataTransfer.items.add(
                file
            );


            videoInput.files =
                dataTransfer.files;


            // ------------------------------------------------
            // Trigger normal selection
            // ------------------------------------------------

            videoInput.dispatchEvent(
                new Event("change")
            );

        }
    );



    // ========================================================
    // UPDATE TOP PREDICTION
    // ========================================================

    function updatePrediction(
        number,
        result
    ) {


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


        if (!result) {

            name.textContent =
                "—";


            score.textContent =
                "--%";


            bar.style.width =
                "0%";


            return;
        }


        name.textContent =
            result.shot;


        score.textContent =
            `${result.confidence}%`;


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
            null
        );


        updatePrediction(
            2,
            null
        );


        updatePrediction(
            3,
            null
        );

    }



    // ========================================================
    // FILE SIZE
    // ========================================================

    function formatFileSize(bytes) {

        if (!bytes) {
            return "0 KB";
        }


        if (bytes < 1024) {

            return (
                bytes +
                " Bytes"
            );

        }


        if (
            bytes <
            1024 * 1024
        ) {

            return (
                (bytes / 1024)
                .toFixed(1)
                + " KB"
            );

        }


        return (
            (bytes /
                (1024 * 1024))
                .toFixed(2)
            + " MB"
        );

    }



    // ========================================================
    // INITIAL STATE
    // ========================================================

    resetResults();


    connectionStatus.textContent =
        "Ready";


    console.log("");
    console.log(
        "Frontend ready."
    );

    console.log(
        "Page reload protection enabled."
    );

});