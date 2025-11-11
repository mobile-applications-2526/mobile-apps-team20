// src/shared/toast.ts
import Toast from "react-native-root-toast";

type ToastSide = "top" | "bottom";

type ShowToastOptions = {
  side?: ToastSide;     
  offset?: number;      
  durationMs?: number;
  backgroundColor?: string;
  textColor?: string;
  icon?: string;
};

export function showToast(message: string, {
  side = "bottom",
  offset = 80,
  durationMs,
  backgroundColor = "#54b863ff",
  textColor = "#fff",
  icon,
}: ShowToastOptions = {}) {

  const text = icon ? `${icon}  ${message}` : message;

  const position =
    side === "top"
      ? (offset ?? Toast.positions.TOP)        
      : -(offset ?? 80);                      

  setTimeout(() => {
    Toast.show(text, {
      duration: durationMs ?? Toast.durations.LONG,
      position,
      shadow: true,
      animation: true,
      hideOnPress: true,
      backgroundColor,
      textColor,
      opacity: 0.98,
      containerStyle: {
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minWidth: 180,
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
      },
      textStyle: {
        fontSize: 14,
        fontWeight: "700",
      },
    });
  }, 50);
}

export const showMessage = (msg: string) =>
  showToast(msg, { side: "bottom", icon: "ℹ️" });

export const showMessageTop = (msg: string) =>
  showToast(msg, { side: "top", icon: "ℹ️" });

export const showErrorTop = (msg: string) =>
  showToast(msg, { side: "top", backgroundColor: "#EF4444", icon: "⚠️" });
