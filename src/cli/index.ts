#!/usr/bin/env node

import program from 'commander';
import {readUrls, gatherUrls, dedupe} from '../index';

program.version('0.0.1')
    .command('read')
    .description('read urls from Chandigarh spread sheet')
    .action(() => {
      readUrls();
    });

program.command('search')
    // .requiredOption('-s, --site <site>', 'site to search')
    // .requiredOption('-t, --term <term>', 'The term to search for on the site', 'chandigarh')
    .action(() => {
      gatherUrls();
    });

program.command('dedupe')
    .option('-t, --test', 'Do not actually clear records from spreadsheet')
    // .requiredOption('-t, --term <term>', 'The term to search for on the site', 'chandigarh')
    .action(async (options) => {
      await dedupe(options.test);
    });

program.parse(process.argv);