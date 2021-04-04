#!/usr/bin/env node

import program from 'commander';
import {readUrls, crawl, dedupe} from '../index';
import {writeURL} from '../writeUrl';
import testData from './testData';
import inquirer from 'inquirer';

program.version('0.0.1')
    .command('read')
    .description('read urls from Chandigarh spread sheet')
    .action(() => {
      readUrls();
    });

program.command('crawl')
    .option('-p, --prod', 'write to prod sheet')
    .action(async (args) => {
      const isWriteToProd = args.prod as boolean;
      console.log(isWriteToProd);
      await crawl(!isWriteToProd);
    });

program.command('dedupe')
    .option('-p, --prod', 'write to prod sheet')
    .action(async (args) => {
      const isWriteToProd = args.prod as boolean;
      await dedupe(!isWriteToProd);
    });

program.command('scratch')
    .action(async (args) => {
      // await writeURL(testData, '1NCz7EIbJK0MoM9Ehj57pLJZjTR7l2gBLK1dY_Lcx3DY', '06/10/2020', true);
    });
program.parse(process.argv);