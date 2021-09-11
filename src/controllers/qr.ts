import QRious from "qrious";

export abstract class QR {

    static async createQRCode(val: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            let code = new QRious({
                value: val,
                level: "H",
                size: 300
            });
            canvas.height = 768;
            canvas.width = 1366;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            let img = new Image();
            img.src = code.toDataURL();
            img.onload = async () => {
                ctx.drawImage(img,
                    canvas.width / 2 - img.width / 2,
                    canvas.height / 2 - img.height / 2);

                let logoImg = new Image();
                logoImg.src = await toDataURL(`https://new.scoresaber.com/api/static/avatars/${val}.jpg`);
                logoImg.crossOrigin = "anonymous";
                logoImg.onload = () => {
                    ctx.drawImage(logoImg,
                        canvas.width / 2 - 50,
                        canvas.height / 2 - 50, 100, 100);
                    resolve(canvas.toDataURL());
                }
            }
        });

    }

    static greenImg() {
        let tmpCanvas: HTMLCanvasElement = document.createElement("canvas");
        tmpCanvas.width = 100;
        tmpCanvas.height = 100;
        let tmpCTX = tmpCanvas.getContext("2d");
        tmpCTX.fillStyle = "#00FF00";
        tmpCTX.fillRect(0, 0, 100, 100);
        // document.getElementById("test").innerHTML += `<img src="${tmpCanvas.toDataURL()}" />`;
        // console.log(_base64ToArrayBuffer(qrCode.toDataURL().replace("data:image/png;base64,", "")));
        return tmpCanvas.toDataURL().replace("data:image/png;base64,", "");
    }

}

function _base64ToArrayBuffer(base64: string) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL;
}

function toDataURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                // callback(reader.result);
                resolve(reader.result as string)
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.send();
    });
}