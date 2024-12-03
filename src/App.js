import ImageUploader from "./Components/ImageUploader";
import { useState } from "react";

function App() {
  const [apiUrl, setApiUrl] = useState("")
  const [hide, set_hide] = useState(false)

  return (
    <div className="App">
      <ImageUploader apiUrl={apiUrl} />
      <div className="hidden_button">
        <button onClick={() => set_hide(!hide)}></button>
        {hide && <textarea type="text" value={apiUrl} placeholder="API url" onChange={(e) => setApiUrl(e.target.value)} />}
      </div>
    </div>
  );
}

export default App;
