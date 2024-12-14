import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const RootRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/explore", { replace: true }); // 如果有 token，重定向到 /explore
    } else {
      navigate("/welcome", { replace: true }); // 如果没有 token，重定向到 /welcome
    }
  }, [navigate]);

  return null; // 不渲染任何内容
};
