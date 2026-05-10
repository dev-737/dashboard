{
  description = "Bun + Prisma 7 + PostgreSQL on NixOS";

  inputs = {
        nixpkgs.url = "nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";

      pkgs = import nixpkgs {
        inherit system;
      };

      nativeDeps = with pkgs; [
        stdenv.cc.cc.lib
        openssl
        zlib
        glib
        libuuid
      ];

    in {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
            pkgs.bun
            pkgs.nodejs
            pkgs.prisma_7
            pkgs.prisma-engines_7

        ] ++ nativeDeps;

        shellHook = ''
          echo "🚀 Bun + Prisma 7 + NixOS"

          export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath nativeDeps}:$LD_LIBRARY_PATH

          # Prisma CLI still occasionally wants these on NixOS
          export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
          export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
          export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
          export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"
        '';
      };
    };
}
