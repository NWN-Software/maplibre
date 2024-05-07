<?php

namespace NWNSoftware\Maplibre\Commands;

use Illuminate\Console\Command;

class MaplibreCommand extends Command
{
    public $signature = 'maplibre';

    public $description = 'My command';

    public function handle(): int
    {
        $this->comment('All done');

        return self::SUCCESS;
    }
}
