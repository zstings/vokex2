export const output = document.getElementById("output") as HTMLDivElement;

export function log(message: string): void {
  output.textContent += message + "\n";
  output.scrollTop = output.scrollHeight;
  console.log(output.textContent);
}

export function clear(): void {
  output.textContent = "";
}