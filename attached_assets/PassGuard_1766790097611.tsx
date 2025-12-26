import React, { useEffect, useState } from "react";
import { api } from "../api";
export const PassGuard: React.FC<{ children: (scope: string[], passType: string) => React.ReactNode; token: string; }> = ({ children, token }) => {
  const [scope, setScope] = useState<string[] | null>(null);
  const [ptype, setPtype] = useState<string>("");
  useEffect(() => {
    api(`/passes/validate`, token).then((d) => { setScope(d.scope); setPtype(d.pass_type); }).catch(() => setScope([]));
  }, [token]);
  if (scope === null) return <div>Loading...</div>;
  if (!scope.length) return <div>Invalid or expired pass.</div>;
  return <>{children(scope, ptype)}</>;
};