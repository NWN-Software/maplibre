<?php

namespace NWNSoftware\Maplibre\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \NWNSoftware\Maplibre\Maplibre
 */
class Maplibre extends Facade
{
    protected static function getFacadeAccessor()
    {
        return \NWNSoftware\Maplibre\Maplibre::class;
    }
}
