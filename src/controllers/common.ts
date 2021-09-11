export function imgErr(e: any) {
    // this.src = "https://scoresaber.com/imports/images/oculus.png";
}

export function titleCase(str: string): string {
    var splitStr = str.split(" ");
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] =
            splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
}

export function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}