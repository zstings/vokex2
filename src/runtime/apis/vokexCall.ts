// 内部调用函数
export default function vokexCall(method: string, params: object = {}): Promise<any> {
  const vokex = (window as any).__VOKEX__;
  if (!vokex?.call) {
    console.warn(`[vokex] 此 API 仅在原生模式下可用`);
    return Promise.resolve(undefined);
  }
  return vokex.call(method, params);
}