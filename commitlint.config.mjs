const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Tính năng mới
        "fix", // Sửa bug
        "docs", // Tài liệu
        "style", // Định dạng code
        "refactor", // Tái cấu trúc code
        "test", // Thêm/sửa test
        "chore", // Công việc bảo trì
        "perf", // Cải thiện performance
        "ci", // CI/CD
        "build", // Build system
        "revert", // Revert commit
      ],
    ],
    "subject-case": [0], // Tắt kiểm tra case của subject
  },
};

export default config;
