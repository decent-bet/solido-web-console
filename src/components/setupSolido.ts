import { SolidoModule, ContractImport, ContractProviderMapping } from '@decent-bet/solido';
import { ConnexPlugin } from '@decent-bet/solido-provider-connex';
import { DBETVETTokenContract, QuestContract, AdminContract } from '@decent-bet/contract-playdbet';

let module: SolidoModule;
let contractMappings: ContractProviderMapping[] = [];

export const setupSolido = async () => {
  contractMappings = [
    {
      name: 'DBETVETToken',
      import: DBETVETTokenContract,
      provider: ConnexPlugin,
      enableDynamicStubs: true,
    },
    {
      name: 'Quest',
      import: QuestContract,
      provider: ConnexPlugin,
      enableDynamicStubs: true,
    },
    {
      name: 'Admin',
      import: AdminContract,
      provider: ConnexPlugin,
      enableDynamicStubs: true,
    },
  ];
  // Create Solido Module
  module = new SolidoModule(contractMappings);

  const cometResult = await (window as any).thor.enable();
  const [defaultAccount] = cometResult;
  const _ = await connex.thor.block(0).get();
  const { id } = connex.thor.genesis;
  const chainTag = `0x${id.substring(id.length - 2, id.length)}`;


  return module.bindContracts({
    connex: {
      provider: connex,
      options: {
        defaultAccount,
        chainTag,
      },
    },
  }).connect();
};

export const rebindSolido = async (name: string, contractImport: ContractImport) => {
  
  // Create Solido Module
  contractMappings = [...contractMappings, {
    name,
    import: contractImport,
    provider: ConnexPlugin,
    enableDynamicStubs: true,
  }]
  module = new SolidoModule(contractMappings);

  const cometResult = await (window as any).thor.enable();
  const [defaultAccount] = cometResult;
  const _ = await connex.thor.block(0).get();
  const { id } = connex.thor.genesis;
  const chainTag = `0x${id.substring(id.length - 2, id.length)}`;

  
  return module.bindContracts({
    connex: {
      provider: connex,
      options: {
        defaultAccount,
        chainTag,
      },
    },
  }).connect();

};
