import { CameraView } from "expo-camera";
import { StyleSheet } from "react-native";

export function CameraPreview() {
  return <CameraView style={styles.camera} facing="front" />;
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});
