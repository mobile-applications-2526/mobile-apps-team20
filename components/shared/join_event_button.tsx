import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type JoinButtonProps = {
  onPress: () => void;
  label?: string;                    // Texto del botón (opcional, default "Join")
  variant?: 'primary' | 'destructive'; // Estilo visual (opcional, default "primary")
};

/**
 * A floating action button (FAB) for joining or leaving an event.
 */
export default function JoinEventButton({ 
  onPress, 
  label = "Join", 
  variant = "primary" 
}: JoinButtonProps) {

  // Decidimos el color según la variante
  const isDestructive = variant === 'destructive';
  const backgroundColor = isDestructive ? "#FF3B30" : "#007AFF"; // Rojo vs Azul

  return (
    <TouchableOpacity 
      style={[styles.joinButton, { backgroundColor }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.joinButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

// Styles for this component
const styles = StyleSheet.create({
  joinButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    // backgroundColor se maneja dinámicamente arriba
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    
    // Sombra
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  joinButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});