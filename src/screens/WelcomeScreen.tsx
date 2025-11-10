import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useSafeAreaInsets, SafeAreaProvider, EdgeInsets } from "react-native-safe-area-context";

type WelcomeScreenProps = {
  navigation: any;
};

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const insets: EdgeInsets = useSafeAreaInsets();

  return (
    <SafeAreaProvider>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Tên app nổi bật */}
          <Text style={styles.title}>Scrolla</Text>

          {/* Subtitle / mô tả */}
          <Text style={styles.subtitle}>
            Chào mừng đến với Scrolla – nơi mọi khoảnh khắc nhỏ nhất cũng có thể trở thành nguồn cảm hứng lớn.
            Hãy bắt đầu sáng tạo theo cách của riêng bạn!
          </Text>

          {/* Placeholder cho ảnh (sẽ thêm sau) */}
          {/* <Image source={require('../assets/welcome.png')} style={styles.image} /> */}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.loginLabel}>Đăng nhập với</Text>

          <TouchableOpacity style={styles.googleButton}>
            <Image
              source={{ uri: "https://www.google.com/favicon.ico" }}
              style={styles.icon}
            />
            <Text style={styles.googleText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.facebookButton}>
            <Text style={styles.facebookText}>f</Text>
            <Text style={styles.buttonText}>Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emailButton}
            //onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.buttonText}>Đăng nhập với email</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.signupLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000", // nền đen toàn màn hình
    justifyContent: "space-between",
  },
  header: {
    flex: 0.55,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 48,
    color: "#fe2c55",
    fontWeight: "bold",
    letterSpacing: 1,
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 30,
    fontStyle : "italic",
  },
  footer: {
    flex: 0.45,
    paddingHorizontal: 40,
    justifyContent: "flex-start",
  },
  loginLabel: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  facebookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1877f2",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  facebookText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 12,
  },
  emailButton: {
    borderWidth: 1,
    borderColor: "#444",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "#aaa",
    fontSize: 14,
  },
  signupLink: {
    color: "#fe2c55",
    fontSize: 14,
    fontWeight: "600",
  },
  // image: {
  //   width: 200,
  //   height: 200,
  //   marginTop: 20,
  // },
});

export default WelcomeScreen;
