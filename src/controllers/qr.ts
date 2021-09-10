import QRious from "qrious";

export class QR {

    code: any;
    canvas: HTMLCanvasElement = document.createElement("canvas");
    private ctx: CanvasRenderingContext2D;

    constructor(value: string) {
        this.code = new QRious({
            value: value,
            level: "H",
            size: 400
        });
        this.canvas.height = 768;
        this.canvas.width = 1366;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        let img = new Image();
        img.src = this.code.toDataURL();
        img.onload = () => {
            this.ctx.drawImage(img,
                this.canvas.width / 2 - img.width / 2,
                this.canvas.height / 2 - img.height / 2);
        }
    }

    get imageData(): Promise<ImageData> {
        return new Promise((resolve, reject) => {
            let logoImg = new Image();
            logoImg.src = "https://cdn.discordapp.com/emojis/708190925448544306.png?v=1";
            logoImg.crossOrigin = "anonymous";
            logoImg.onload = () => {
                this.ctx.drawImage(logoImg,
                    this.canvas.width / 2 - logoImg.width / 2,
                    this.canvas.height / 2 - logoImg.height / 2);

                resolve(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
            };
        });
    }

    get base64(): Promise<string> {
        return new Promise((resolve, reject) => {
            let logoImg = new Image();
            logoImg.src = "https://cdn.discordapp.com/emojis/708190925448544306.png?v=1";
            logoImg.crossOrigin = "anonymous";
            logoImg.onload = () => {
                this.ctx.drawImage(logoImg,
                    this.canvas.width / 2 - logoImg.width / 2,
                    this.canvas.height / 2 - logoImg.height / 2);
                resolve(this.canvas.toDataURL());
            };
        });
    }

    get base64Data() {
        return (async () => (await this.base64).replace("data:image/png;base64,", ""))();
    }

    get buffer() {
        return (async () => {
            return _base64ToArrayBuffer((await this.base64).replace("data:image/png;base64,", ""))
        })();
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