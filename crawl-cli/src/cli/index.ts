#!/usr/bin/env node

import program from 'commander';
import {readUrls, crawl, dedupe} from '../index';
import {writeURL} from '../writeUrl';
import testData from './testData';
import inquirer from 'inquirer';
import {searchSite} from '../searchSite';
import SheetWrapper from '../SheetWrapper';
import {OAuth2Client} from 'google-auth-library';

program.version('0.0.1')
    .command('read')
    .description('read urls from Chandigarh spread sheet')
    .action(() => {
      readUrls();
    });

program.command('crawl')
    .option('-p, --prod', 'write to prod sheet')
    .option('-t, --time-frame <type>', 'time frame to search')
    .action(async (args) => {
      const isWriteToProd = args.prod as boolean;
      const timeFrame = args.timeFrame as string;
      console.log(isWriteToProd);
      await crawl(!isWriteToProd, timeFrame);
    });

program.command('dedupe')
    .option('-p, --prod', 'write to prod sheet')
    .action(async (args) => {
      const isWriteToProd = args.prod as boolean;
      await dedupe(!isWriteToProd);
    });

program.command('search')
    .option('-s, --site <type>', 'site to search')
    .option('-t, --time-frame <type>', 'time frame to search')
    .action(async (args) => {
      const domain = args.site as string;
      const query = `site:${domain} Chandigarh`      
      const timeFrame = args.timeFrame as string;
      searchSite(query, timeFrame)
    });    

program.command('scratch')
    .action(async (args) => {

      // await writeURL(testData, '1NCz7EIbJK0MoM9Ehj57pLJZjTR7l2gBLK1dY_Lcx3DY', '06/10/2020', true);
    });
program.parse(process.argv);