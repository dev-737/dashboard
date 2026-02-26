{
  description = "Multi-platform Bun + Prisma + Python Dev Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        buildDeps = with pkgs; [
          bun
          uv
          python312
        ];

        linuxNativeDeps = pkgs.lib.optionals pkgs.stdenv.isLinux (with pkgs; [
          stdenv.cc.cc.lib
          zlib
          glib
          openssl
          libglvnd
          xorg.libX11
          libxml2
          libuuid
          prisma
        ]);

        # Define Prisma Environment
        prismaEnv = {
          PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
          PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
          PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt"; # Added for formatting/VS Code
          # PRISMA_CLIENT_ENGINE_TYPE = "binary"; # Important for NixOS!
        };

      in
      {
        devShells.default = pkgs.mkShell {
          # Combine the common tools with the OS-specific dependencies
          buildInputs = buildDeps ++ linuxNativeDeps;

          shellHook = ''
            echo "🚀 Multi-platform Dev Shell Loaded"

            # FIX: Ensure Nix's isolated temporary directory actually exists
            mkdir -p "$TMPDIR"

            # Apply Prisma Environment Variables
            ${builtins.concatStringsSep "\n" (pkgs.lib.mapAttrsToList (name: value: "export ${name}=${value}") prismaEnv)}

            # Configure UV/Python
            export UV_PYTHON="${pkgs.python312}/bin/python"
            export UV_PYTHON_DOWNLOADS="never"
            export LANG=C.UTF-8

            # Linux-specific: Force Bun/Node to look in Nix store for dynamic libraries
            ${pkgs.lib.optionalString pkgs.stdenv.isLinux ''
              export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath linuxNativeDeps}:$LD_LIBRARY_PATH
            ''}
          '';
        };
      }
    );
}
