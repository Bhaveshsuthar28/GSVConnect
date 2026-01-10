export const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle("dark");

    localStorage.setItem("theme", isDark ? "dark" : "light");
};
