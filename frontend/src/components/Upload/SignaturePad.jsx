import { useRef, useEffect } from "react";
import SignaturePad from "signature_pad";

export default function SignaturePadComponent({ onSave }) {
  const canvasRef = useRef(null);
  let sigPad = useRef(null);

  useEffect(() => {
    sigPad.current = new SignaturePad(canvasRef.current);
  }, []);

  const saveSignature = () => {
    const dataURL = sigPad.current.toDataURL("image/png");
    onSave(dataURL); // send base64 to Upload.jsx
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="border"
      />
      <button onClick={saveSignature}>Save Signature</button>
    </div>
  );
}