<?php

namespace NWNSoftware\Maplibre\Actions;

use Filament\Actions\ViewAction as BaseViewAction;
use Filament\Infolists\Infolist;
use NWNSoftware\Maplibre\Widgets\MapLibreWidget;

class ViewAction extends BaseViewAction
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->model(
            fn (MapLibreWidget $livewire) => $livewire->getModel()
        );

        $this->record(
            fn (MapLibreWidget $livewire) => $livewire->getRecord()
        );

        $this->infolist(
            fn (MapLibreWidget $livewire, Infolist $infolist): Infolist => $livewire->getInfolistSchema($infolist)
        );

        $this->cancelParentActions();
    }
}
