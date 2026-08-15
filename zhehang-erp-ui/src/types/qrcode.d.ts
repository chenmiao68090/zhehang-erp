declare module 'qrcode' {
  interface ToDataURLOptions {
    width?: number
    margin?: number
  }

  const QRCode: {
    toDataURL(text: string, options?: ToDataURLOptions): Promise<string>
  }

  export default QRCode
}
