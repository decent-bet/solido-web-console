import { SolidoModule, ContractImport, ContractProviderMapping } from "@decent-bet/solido";
import { ConnexPlugin } from "@decent-bet/solido-provider-connex";
import * as contracts from "@decent-bet/contract-playdbet";
import {
  QuestContract as QuestContractEntity,
  DBETVETTokenContract as TokenEntity,
  TournamentContract as TournamentEntity,
  DBETNodeContract as DBETNodeEntity,
  NodeWalletContract as NodeWalletEntity,
  AdminContract
} from "@decent-bet/playdbet-contract-entities";

let module: SolidoModule;
let contractMappings: ContractProviderMapping[] = [];

export const setupSolido = async () => {
  contractMappings = [
    {
      name: "DBETVETToken",
      import: contracts.DBETVETTokenContract,
      provider: ConnexPlugin,
      entity: TokenEntity,
      enableDynamicStubs: true
    },
    {
      name: "Quest",
      import: contracts.QuestContract,
      entity: QuestContractEntity,
      provider: ConnexPlugin,
      enableDynamicStubs: true
    },
    {
      name: "Tournament",
      import: contracts.TournamentContract,
      entity: TournamentEntity,
      provider: ConnexPlugin,
      enableDynamicStubs: true
    },
    {
      name: "DBETNode",
      import: (<any>contracts).DBETNode,
      entity: DBETNodeEntity,
      provider: ConnexPlugin,
      enableDynamicStubs: true
    },
    {
      name: "NodeWallet",
      import: (<any>contracts).NodeWallet,
      entity: NodeWalletEntity,
      provider: ConnexPlugin,
      enableDynamicStubs: true
    },
    {
      name: "Admin",
      import: contracts.AdminContract,
      entity: AdminContract,
      provider: ConnexPlugin,
      enableDynamicStubs: true
    }
  ];
  // Create Solido Module
  module = new SolidoModule(contractMappings);

  const cometResult = await (window as any).thor.enable();
  const [defaultAccount] = cometResult;
  const _ = await connex.thor.block(0).get();
  const { id } = connex.thor.genesis;
  const chainTag = `0x${id.substring(id.length - 2, id.length)}`;

  return module
    .bindContracts({
      connex: {
        provider: connex,
        options: {
          defaultAccount,
          chainTag
        }
      }
    })
    .connect();
};

export const rebindSolido = async (name: string, contractImport: ContractImport) => {
  // Create Solido Module
  contractMappings = [
    ...contractMappings,
    {
      name,
      import: contractImport,
      provider: ConnexPlugin,
      enableDynamicStubs: true
    }
  ];
  module = new SolidoModule(contractMappings);

  const cometResult = await (window as any).thor.enable();
  const [defaultAccount] = cometResult;
  const _ = await connex.thor.block(0).get();
  const { id } = connex.thor.genesis;
  const chainTag = `0x${id.substring(id.length - 2, id.length)}`;

  return module
    .bindContracts({
      connex: {
        provider: connex,
        options: {
          defaultAccount,
          chainTag
        }
      }
    })
    .connect();
};
