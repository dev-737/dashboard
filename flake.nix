# flake.nix
{
  description = "A Bun project on NixOS";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux"; # Or aarch64-darwin, etc.
      pkgs = import nixpkgs {
        inherit system;
      };

      # Define Prisma engines for easier reuse
      prismaEngines = with pkgs; [
        prisma-engines
      ];

      # Define environment variables for Prisma engines
      prismaEnvVars = {
        PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
        PRISMA_INTROSPECTION_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/introspection-engine";
        PRISMA_SCHEMA_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/schema-engine";
      };

      # Common dependencies for native Node.js/Bun modules
      # and potentially specific SWC tools from Nixpkgs
      nativeModuleDeps = with pkgs; [
        glibc # Fundamental C library
        zlib # Common compression library
        libgcc # GNU Compiler Collection runtime libraries
        stdenv.cc.cc.lib # C++ standard library, crucial for many native modules
        openssl # OpenSSL is often required
      ];

    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          bun
        ] ++ prismaEngines ++ nativeModuleDeps; # Add native module dependencies

        # autoPatchelfHook helps patch binaries to find dynamic libraries
        # It's often included by default in pkgs.stdenv.mkDerivation,
        # but for mkShell, we might need to be more explicit if issues persist.
        # For now, just adding deps to buildInputs is the first step.

        shellHook = ''
          echo "Bun, Prisma, and Next.js development shell ready!"
          export PRISMA_QUERY_ENGINE_BINARY="${prismaEnvVars.PRISMA_QUERY_ENGINE_BINARY}"
          export PRISMA_INTROSPECTION_ENGINE_BINARY="${prismaEnvVars.PRISMA_INTROSPECTION_ENGINE_BINARY}"
          export PRISMA_SCHEMA_ENGINE_BINARY="${prismaEnvVars.PRISMA_SCHEMA_ENGINE_BINARY}"
          export PRISMA_CLIENT_ENGINE_TYPE="binary"

          # Fix for loading native modules (like @next/swc) on NixOS
          export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath nativeModuleDeps}:$LD_LIBRARY_PATH

          # Optional: increase verbosity for native module loading
          # export LD_DEBUG=libs # Can be very noisy
        '';
      };

      packages.${system}.my-bun-project = pkgs.stdenv.mkDerivation {
        pname = "my-bun-project";
        version = "0.1.0";
        src = ./.;

        buildInputs = with pkgs; [
          bun
        ] ++ prismaEngines ++ nativeModuleDeps; # Add native module dependencies

        # autoPatchelfHook is crucial here for fixing the native module's library paths
        # This hook automatically patches ELF binaries in the source tree to correctly
        # link against the dependencies provided in buildInputs.
        nativeBuildInputs = [ pkgs.autoPatchelfHook ];

        configurePhase = ''
          export PRISMA_QUERY_ENGINE_BINARY="${prismaEnvVars.PRISMA_QUERY_ENGINE_BINARY}"
          export PRISMA_INTROSPECTION_ENGINE_BINARY="${prismaEnvVars.PRISMA_INTROSPECTION_ENGINE_BINARY}"
          export PRISMA_SCHEMA_ENGINE_BINARY="${prismaEnvVars.PRISMA_SCHEMA_ENGINE_BINARY}"
          export PRISMA_CLIENT_ENGINE_TYPE="binary"

          bun install --frozen-lockfile
        '';

        buildPhase = ''
          bun prisma generate
          # Also run Next.js build here if it includes SWC compilation
          # bun run build # or 'next build'
        '';

        installPhase = ''
          mkdir -p $out/bin
          cp -r . $out/lib/${self.name}-${self.version}
          ln -s $out/lib/${self.name}-${self.version}/index.ts $out/bin/my-bun-app
          # Ensure necessary assets/files for Next.js are copied for runtime
        '';
      };
    };
}
