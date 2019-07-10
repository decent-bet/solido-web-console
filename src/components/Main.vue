<template>
  <v-app dark>
    <v-navigation-drawer app overflow clipped floating>
      <v-list dense>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>DBETs</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-list-tile-sub-title>{{ DBETs }}</v-list-tile-sub-title>
          </v-list-tile-action>
        </v-list-tile>

        <v-divider></v-divider>
        <v-list-tile>
          <v-list-tile-content>
            <v-list-tile-title>VTHO</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-list-tile-sub-title>{{ energy }}</v-list-tile-sub-title>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
      <v-divider></v-divider>
      <v-list>
        <v-list-tile>
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Contracts</v-list-tile-title>
        </v-list-tile>
      </v-list>
      <v-treeview
        :items="contractView"
        v-slot:prepend="{ item }"
        item-key="id"
        item-text="label"
        item-children="items"
        open-on-click
        activatable
        return-object
        :active.sync="active"
      >
      <template v-if="item.type">
        <v-icon color="warning" v-if="item.type === 'method'">playlist_play</v-icon>
        <v-icon color="primary" v-else-if="item.type === 'event'">playlist_add_check</v-icon>
        <span>{{ item.type }}</span>
      </template>
      </v-treeview>
    </v-navigation-drawer>
    <v-toolbar app clipped-left>
      <v-btn flat large color="transparent">
        <img width="50" src="@/assets/logo.png" contain />
      </v-btn>
      <v-toolbar-title>DecentBet Contracts CLI - {{ network }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn flat>Address: {{ address }}</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <v-layout>
          <v-flex>
            <v-card>
              <v-list>
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon color="white">star</v-icon>
                  </v-list-tile-action>

                  <v-list-tile-content>
                    <v-list-tile-title>
                      Open Chrome Inspector to access Solido CLI
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                  <v-list-tile-action>
                    <v-icon color="white">star</v-icon>
                  </v-list-tile-action>

                  <v-list-tile-content>
                    <v-list-tile-title>
                      Type contracts or a contract name to start
                    </v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-card>
            <p></p>
            <v-alert
                  v-if="currentActive"
                  class="text-xs-left"
                  style="width: 100%"
                  :value="true"
                  :color="currentActive.type === 'method' ? 'warning' : 'primary'"
                  :icon="currentActive.type === 'method' ? 'playlist_play' : 'playlist_add_check'"
                >
                  {{ `${currentActive.contractName}.${currentActive.id}${(currentActive.type === 'method' ? '()': '')}`}}
                </v-alert>

            <v-card v-if="currentMemberAbi">
              <v-card-title class="text-xs-left">
                <h3>Attributes</h3>
              </v-card-title>
              <v-card-text>
                    <v-list>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>
                            Constant: <code>{{currentMemberAbi.constant}}</code>
                          </v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>
                            Name: <code>{{currentMemberAbi.name}}</code>
                          </v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>
                            Type: <code>{{currentMemberAbi.type}}</code>
                          </v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>
                            Payable: <code>{{currentMemberAbi.payable}}</code>
                          </v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>
                            StateMutability: <code>{{currentMemberAbi.stateMutability}}</code>
                          </v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile>
                        <v-list-tile-content>
                          <v-list-tile-title>
                            Signature: <code>{{currentMemberAbi.signature}}</code>
                          </v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-list>
              </v-card-text>
              </v-card>

              <v-card v-if="currentMemberAbi">
                <v-form>
                <v-card-title class="text-xs-left" v-if="inputs.length > 0">
                  <h3>Inputs</h3>
                </v-card-title>
                <v-card-text v-if="inputs.length > 0">
                   <v-text-field
                    style="margin-top: 1em"
                    v-for="(input, index) in inputs"
                    :key="index"
                    v-model="form[input.name]"
                    :label="`${input.name} ${(input.indexed ? '(indexed)': '')}`"
                    persistent-hint
                    :hint="input.type"
                    :required="input.indexed"
                  ></v-text-field>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" @click="didClickOnCall">Call</v-btn>
                  <v-btn @click="didClickOnClear">Clear</v-btn>
                </v-card-actions>
              </v-form>
              </v-card>
              <v-card style="margin-top: 1em; width: 100%; text-align: left">
              <v-flex>
                 <code d-flex style="width: 100%">
                    {{formError}}
                    {{result}}
                 </code>
              </v-flex>
              </v-card>
              <v-card v-if="outputs.length > 0">
                <v-card-title class="text-xs-left">
                  <h3>Outputs</h3>
                </v-card-title>
              <v-card-text>
                  <v-list>
                <v-list-tile v-for="out in outputs" :key="out.name">
                        <v-list-tile-content v-if="out">
                          <v-list-tile-title>
                               {{out.name}}:  {{out.type}}
                          </v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-list>
               </v-card-text>
              </v-card>
          </v-flex>
        </v-layout>
        <v-dialog v-model="dialog" width="500">
          <template v-slot:activator="{ on }">
            <v-btn color="blue lighten-2" dark v-on="on">Add contract</v-btn>
          </template>
          <v-card>
            <v-card-title class="headline blue" primary-title>Add Contract</v-card-title>
            <v-card-text>
              <v-text-field v-model="contractName" label="Name"></v-text-field>
              <v-text-field v-model="contractAddress" label="Adress"></v-text-field>
              <v-textarea
                box
                label="v0.5.0"
                name="contractCode"
                v-model="contractCode"
                @change="handleCompile"
              ></v-textarea>
              <div v-if="isCompilationComplete">{{ compileMessage }}</div>
              <div v-if="isCompilationComplete === false">
                Errors while compiling, verify contract
              </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" flat @click="importContract()">
                Import
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <p></p>
        <v-flex>
          <v-card>
            <v-card-title primary-title>Decode tool</v-card-title>
            <v-card-text>
                <v-flex>
                  <v-textarea
                    label="Encoded data"
                    v-model="encodedData"
              ></v-textarea>
                <p></p>
                </v-flex>
                <v-flex>
                  <code style="width: 100%; text-align: left">{{decodedData}}</code>
                </v-flex>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
               <v-btn color="waring" @click="decodeData()">
                Decode Data
              </v-btn>
            </v-card-actions>
          </v-card>
      </v-flex>
      </v-container>
    </v-content>
    <v-footer app>

    </v-footer>
  </v-app>
</template>

<script lang="ts">
/* eslint class-methods-use-this: ["error",
{ "exceptMethods": ["getLeaf", "onActive", "callMethod"] }] */
const devkit = require('thor-devkit');
import {
  Component,
  Prop,
  Vue,
  Watch,
} from 'vue-property-decorator';
import { BigNumber } from 'bignumber.js';
import * as solcjs from 'solc-js';
import { setupSolido, rebindSolido } from './setupSolido';
import { ContractImport } from '@decent-bet/solido';
import { utils } from './utils';

@Component
export default class Main extends Vue {
  readonly ETHER = 10 ** 18;

  contractAddress: string = '';

  contractName: string = '';

  contractCode: string = '';

  active: any[] = [];

  to = '';

  amount: number = 0;

  energy: number = -1;

  DBETs: number = -1;

  network: string = '';

  address: string = '';

  version: string = '';

  dialog: any = null;

  encodedData: any = null;

  decodedData: any = null

  abi: any = {};

  form: any = {};

  formError: any = null;

  isCompilationComplete: boolean = true;

  compileMessage: string = '';

  log = '';

  contractView: any[] = [];

  currentMemberAbi: any = null;

  result: any = null;

  get inputs() {
    if (this.currentMemberAbi && this.currentMemberAbi.inputs) {
      return this.currentMemberAbi.inputs;
    }
    return [];
  }

  get outputs() {
    if (this.currentMemberAbi && this.currentMemberAbi.outputs) {
      return this.currentMemberAbi.outputs;
    }
    return [];
  }

  get currentActive() {
   if (this.active) {
      if (this.active.length > 0) {
        const { contractName, id, type } = this.active[0];
        return { contractName, id, type };
      }
    }

    return null;
  }

  async transferDBET() {
    const $w = window as any;
    const tx = await $w.contracts.DBETVETToken.methods.transfer(
      this.to,
      new BigNumber(this.amount).multipliedBy(this.ETHER),
    );
    this.log = tx;
  }

  async decodeData() {
    if(this.encodedData) {
      const fn = new devkit.abi.Function(this.currentMemberAbi);
      this.decodedData = fn.decode(this.encodedData);
    }
  }

  @Watch('active')
  async onActive(value: any[]) {
    if (value) {
      if (value.length > 0) {
        this.didClickOnClear();
        const { contractName, id, type } = value[0];
        await this.setMemberDetail(contractName, id, type);
      }
    } else {
      this.didClickOnClear();
    }
  }

  async handleCompile() {
    try {
      this.compileMessage = '';
      this.compileMessage = 'Compiling...';
      const compiler = await solcjs(this.version);
      this.isCompilationComplete = true;

      const output = await compiler(this.contractCode);
      this.abi = output[0].abi;
      this.compileMessage = 'ABI is ready';
      this.isCompilationComplete = true;
    } catch (e) {
      console.log(e);
      this.isCompilationComplete = false;
    }
  }

  async didClickOnCall() {
     this.result = null;
     this.formError = null;
      if(this.currentActive) {
        const { contractName, id, type } = this.currentActive;
        try {
          const $w = window as any;
          if ($w.contracts) {
            const contract = $w.contracts[contractName];
            if (type === 'method') {
              let data;
              const fn = contract.methods[id];
               if (this.inputs.length > 0) {
                  const params = Object.values(this.form);
                  data = await fn.apply(null, params);
               } else {
                  data = await fn.apply(null);
               }

               this.result = data.decoded['0'];

            } else if (type === 'event') {
              let data;
              const event = contract.events[id];
              let filter = {};
              if (this.inputs.length > 0) {
                filter = {...this.form};
                console.log('filter', filter);
              }

              const result =  await event.filter(filter)
                    .order('desc')
                    .apply(0, 1000);

            } else {
              return;
            }
          }
        } catch (error) {
          this.formError = error;
        }
    }
  }

  didClickOnClear() {
     this.form = {};
     this.result = null;
     this.formError = null;
  }

  async importContract() {
    try {
      this.compileMessage = '';
      this.compileMessage = 'Compiling...';
      const compiler = await solcjs(this.version);
      this.isCompilationComplete = true;

      const output = await compiler(this.contractCode);
      this.abi = output[0].abi;
      this.compileMessage = 'ABI is ready';
      this.isCompilationComplete = true;
      const contractImport: ContractImport = {
        address: this.contractAddress,
        raw: { abi: this.abi }
      }

      // add to contracts
      const $w = window as any;
      $w.contracts = await rebindSolido(this.contractName, contractImport);

    } catch (e) {
      console.log(e);
      this.isCompilationComplete = false;
    }
  }

  async beforeMount() {
    const { releases } = await solcjs.versions();
    this.version = releases.find((i: any) => i.indexOf('v0.5.0-stable') > -1);

    const awaiter: any = (promiseFn: Promise<any>) => {
      promiseFn.then(console.log, console.log);
      return 'promise executed';
    };

    const $w = window as any;
    $w.ETHER = this.ETHER;
    $w.awaiter = awaiter;
    $w.contracts = await setupSolido();
    $w.BigNumber = BigNumber;
    //    $w.contracts.helpers = utils($w.contracts);
    Object.keys($w.contracts).forEach((key) => {
      $w[key] = $w.contracts[key];
    });

    if ($w.contracts.Quest.chainTag === '0x27') {
      this.network = 'testnet';
    } else {
      this.network = 'mainnet';
    }

    this.address = $w.contracts.Quest.defaultAccount;
    // this.energy = await $w.contracts.
    const data = await $w.contracts.DBETVETToken.methods.balanceOf(
      this.address,
    );
    this.DBETs = new BigNumber(data.decoded['0'])
      .dividedBy(this.ETHER)
      .toNumber();

    this.loadContractTreeview($w.contracts);
  }

  getLeaf(contractName: string, items: any, type: string) {
    if (!items) return [];
    return Object.keys(items).map((key: string) => {
      const fn = items[key];
      return {
        id: key,
        label: key,
        type,
        contractName,
      };
    });
  }

  loadChild(contractName: string, methods: any, events: any) {
    return [
      ...this.getLeaf(contractName, methods, 'method'),
      ...this.getLeaf(contractName, events, 'event'),
    ];
  }

  loadContractTreeview(contracts: any) {
    const tree = Object.keys(contracts).map((key: string) => {
      const c = contracts[key];
      return {
        c,
        id: key,
        label: key,
        // get methods
        items: this.loadChild(key, c.methods, c.events),
      };
    });

    this.contractView = tree;
  }

  async setMemberDetail(contractName: string, name: string, type: string) {
    const $w = window as any;
    if ($w.contracts) {
      const contract = $w.contracts[contractName];
      const abi = contract.abi.find((m: any) => m.name === name);
      this.currentMemberAbi = abi;
      abi.inputs.forEach((i: any) => {
          this.form[i.name] = null;
      });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
