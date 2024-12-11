import { useEffect, useState } from "react"
import { fetchStockRsList } from "./services/us-rs-screener.service";
import { Stock } from "./models/Stock";

function App() {

  const [stockList, setStockList] = useState<Stock[]>([]);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    fetchStockRsList
      .then(response => response.clone().json())
      .then((json: Stock[]) => setStockList(json))
      .catch(e => {
        console.error(e);
        setError('Something went wrong');
      });
  }, []);

  return (
    <>
      <h1>Ping Stock Screener</h1>
      <p>{error}</p>
      {stockList.map(e => (<p key={e.ticker}>{e.ticker} - {e.close} - {e.rsRating}</p>))}
    </>
  )
}

export default App
