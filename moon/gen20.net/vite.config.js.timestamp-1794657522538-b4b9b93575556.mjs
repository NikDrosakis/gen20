// vite.config.js
import { defineConfig, loadEnv } from "file:///var/www/gs/moon/gen20.net/.yarn/__virtual__/vite-virtual-804eb87cdb/6/root/.yarn/berry/cache/vite-npm-5.4.21-12a8265f9b-10c0.zip/node_modules/vite/dist/node/index.js";
import react from "file:///var/www/gs/moon/gen20.net/.yarn/__virtual__/@vitejs-plugin-react-virtual-0e04a89907/6/root/.yarn/berry/cache/@vitejs-plugin-react-npm-6.3.0-c2593f0aab-10c0.zip/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = env.MOON_HOST;
  return {
    plugins: [react({ jsxRuntime: "automatic" })],
    resolve: {
      alias: {
        "@manifest": `/var/www/gs/data/${host}/moon_manifest.json`
      }
    },
    server: { fs: { allow: ["/var/www/gs/data", "."] } }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvdmFyL3d3dy9ncy9tb29uL2dlbjIwLm5ldFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Zhci93d3cvZ3MvbW9vbi9nZW4yMC5uZXQvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Zhci93d3cvZ3MvbW9vbi9nZW4yMC5uZXQvdml0ZS5jb25maWcuanNcIjsvLyB2aXRlLmNvbmZpZy5qcyAoXHUwM0JBXHUwM0JGXHUwM0I5XHUwM0JEXHUwM0NDIFx1MDNCM1x1MDNCOVx1MDNCMSBcdTAzQ0NcdTAzQkJcdTAzQjEgXHUwM0M0XHUwM0IxIG1vb24pXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgXCJcIik7XG4gIGNvbnN0IGhvc3QgPSBlbnYuTU9PTl9IT1NUOyAgIC8vIFx1MDNDMC5cdTAzQzcuIGdlbjIwLm5ldCwgXHUwM0IxXHUwM0MwXHUwM0NDIFx1MDNDNFx1MDNCRiBwcmVidWlsZC8uZW52XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoeyBqc3hSdW50aW1lOiBcImF1dG9tYXRpY1wiIH0pXSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBtYW5pZmVzdFwiOiBgL3Zhci93d3cvZ3MvZGF0YS8ke2hvc3R9L21vb25fbWFuaWZlc3QuanNvbmAsXG4gICAgICB9LFxuICAgIH0sXG4gICAgc2VydmVyOiB7IGZzOiB7IGFsbG93OiBbXCIvdmFyL3d3dy9ncy9kYXRhXCIsIFwiLlwiXSB9IH0sXG4gIH07XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxjQUFjLGVBQWU7QUFDdEMsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUMzQyxRQUFNLE9BQU8sSUFBSTtBQUVqQixTQUFPO0FBQUEsSUFDTCxTQUFTLENBQUMsTUFBTSxFQUFFLFlBQVksWUFBWSxDQUFDLENBQUM7QUFBQSxJQUM1QyxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxhQUFhLG9CQUFvQixJQUFJO0FBQUEsTUFDdkM7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLEVBQUU7QUFBQSxFQUNyRDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
