import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "../../../store/themeStore";
import { appThemes } from "../../theme/theme";

const PURPLE = "#6366F1";

export default function CreatePostScreen() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const colors = appThemes[themeMode].colors;
  const insets = useSafeAreaInsets();

  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState(["DesignSystems", "UIUx"]);
  const [newTag, setNewTag] = useState("");
  const maxCaptionLength = 2200;
  const maxTags = 5;

  const handleAddTag = () => {
    if (
      newTag.trim() &&
      tags.length < maxTags &&
      !tags.includes(newTag.trim())
    ) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handlePublish = () => {
    console.log("Publishing post...");
  };

  const handleCancel = () => {
    console.log("Cancelled");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.headerBar,
          {
            height: 64 + insets.top,
            paddingTop: insets.top,
            borderBottomColor: colors.border || "#E5E7EB",
            shadowColor: colors.shadow || "#111827",
          },
        ]}
      >
        <View style={styles.headerBrandRow}>
          <Text
            style={[styles.headerTitle, { color: colors.text || "#111827" }]}
          >
            Create Post
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
        <TouchableOpacity
          style={[
            styles.uploadArea,
            { borderColor: colors.border || "#D1D5DB" },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.uploadContent}>
            <Ionicons name="cloud-upload-outline" size={40} color={PURPLE} />
            <Text
              style={[styles.uploadTitle, { color: colors.text || "#111827" }]}
            >
              Upload Media
            </Text>
            <Text
              style={[
                styles.uploadSubtitle,
                { color: colors.mutedText || "#9CA3AF" },
              ]}
            >
              High-res images or 4K video (max 500MB)
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.mutedText || "#6B7280" },
            ]}
          >
            CAPTION
          </Text>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.card || "#FFFFFF" },
            ]}
          >
            <TextInput
              style={[styles.captionInput, { color: colors.text || "#111827" }]}
              placeholder="What's on your mind? Share your creative process..."
              placeholderTextColor={colors.mutedText || "#9CA3AF"}
              multiline
              maxLength={maxCaptionLength}
              value={caption}
              onChangeText={setCaption}
              textAlignVertical="top"
            />
            <Text
              style={[
                styles.charCounter,
                { color: colors.mutedText || "#9CA3AF" },
              ]}
            >
              {caption.length}/{maxCaptionLength}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tagsHeader}>
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.mutedText || "#6B7280" },
              ]}
            >
              TAGS
            </Text>
            <Text
              style={[
                styles.tagsLimit,
                { color: colors.mutedText || "#9CA3AF" },
              ]}
            >
              Add up to {maxTags}
            </Text>
          </View>
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View
                key={index}
                style={[
                  styles.tagChip,
                  { backgroundColor: colors.tagBg || "#EEF2FF" },
                ]}
              >
                <Text style={[styles.tagText, { color: PURPLE }]}>#{tag}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveTag(tag)}
                  style={styles.tagRemove}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={16} color={PURPLE} />
                </TouchableOpacity>
              </View>
            ))}
            {tags.length < maxTags && (
              <TouchableOpacity
                style={[
                  styles.addTagButton,
                  {
                    borderColor: colors.border || "#D1D5DB",
                    backgroundColor: colors.card || "#FFFFFF",
                  },
                ]}
                onPress={handleAddTag}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="add"
                  size={16}
                  color={colors.mutedText || "#6B7280"}
                />
                <Text
                  style={[
                    styles.addTagText,
                    { color: colors.mutedText || "#6B7280" },
                  ]}
                >
                  Add tag
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                borderColor: colors.border || "#D1D5DB",
                backgroundColor: colors.card || "#FFFFFF",
              },
            ]}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.cancelButtonText,
                { color: colors.text || "#111827" },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.publishButton, { backgroundColor: PURPLE }]}
            onPress={handlePublish}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.publishButtonText}>Publish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    zIndex: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  headerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  uploadArea: {
    height: 200,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  uploadContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  uploadSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputContainer: {
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
  },
  captionInput: {
    fontSize: 16,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCounter: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 8,
  },
  tagsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tagsLimit: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tagRemove: {
    marginLeft: 4,
    padding: 2,
  },
  addTagButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addTagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  publishButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  publishButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
