#!/usr/bin/env node

import program from 'commander';
import {readUrls, searchSite} from '../index';

program.version('0.0.1')
    .command('read')
    .description('read urls from Chandigarh spread sheet')
    .action((args) => {
      readUrls();
    });

program.command('search')
    .requiredOption('-s, --site <site>', 'site to search')
    .requiredOption('-t, --term <term>', 'The term to search for on the site', 'chandigarh')
    .action((args) => {
      const result = searchSite(args.site, args.term);
      console.log(result);
    });


program.parse(process.argv);