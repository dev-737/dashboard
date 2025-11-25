{
  description = "A Bun project on NixOS";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };

      # These fixes "File not found" or "GLIBC_XX not found" errors
      nativeDeps = with pkgs; [
        stdenv.cc.cc.lib
        zlib
        glib
        openssl
        libglvnd
        xorg.libX11
        libxml2
        libuuid
      ];

      # Define Prisma Environment
      prismaEnv = {
        PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
        PRISMA_INTROSPECTION_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/introspection-engine";
        PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
        PRISMA_CLIENT_ENGINE_TYPE = "binary"; # Important for NixOS!
      };

    in
    {
      devShells.${system}.default = pkgs.mkShell {
        # Tools available in the terminal
        buildInputs = with pkgs; [
          bun
          uv
          python314 # Changed from 314 to a real version
        ] ++ nativeDeps;

        shellHook = ''
          echo "🚀 Bun + Prisma + Python Dev Shell"

          # Apply Prisma Environment Variables
          ${builtins.concatStringsSep "\n" (pkgs.lib.mapAttrsToList (name: value: "export ${name}=${value}") prismaEnv)}

          # Configure UV/Python
          export UV_PYTHON="${pkgs.python312}/bin/python"
          export UV_PYTHON_DOWNLOADS="never"
          export LANG=C.UTF-8

          # Force Bun/Node to look in Nix store for dynamic libraries (fixes @next/swc, sharp, etc.)
          export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath nativeDeps}:$LD_LIBRARY_PATH
        '';
      };
    };
}
