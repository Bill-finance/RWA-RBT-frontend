import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import BillManagement from "./components/BillManagement";
// 假设存在首页组件，若没有可替换为合适的组件
import HomePage from "./components/HomePage";
import MyIssuedTokens from "./pages/MyIssuedTokens";
import TokenMarket from "./pages/TokenMarket";
import RepayDebtList from "./components/RepayDebtList";
import PendingSignatureList from "./components/PendingSignatureList";
import MyTokenList from "./components/MyTokenList";

const handleSign = (data: {
  tokenBatchNumber: string;
  creditorAccount: string;
  debtor: string;
  stablecoin: string;
  billQuantity: number;
  issuedAmount: bigint;
}) => {
  console.log("执行签名操作，数据为:", data);
  alert("调钱包操作， 钱包操作时给信息 =>" + JSON.stringify(data));
  // 可以在这里添加实际的签名逻辑
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        {/* <Header /> */}
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/my-credits/my-bills" element={<BillManagement />} />
            <Route
              path="/my-credits/my-issued-tokens"
              element={<MyIssuedTokens />}
            />
            <Route path="/token-market" element={<TokenMarket />} />
            <Route path="/my-debts/repay-debt" element={<RepayDebtList />} />
            <Route
              path="/my-debts/my-todolist"
              element={<PendingSignatureList onSign={handleSign} />}
            />
            <Route path="/my-tokens" element={<MyTokenList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
