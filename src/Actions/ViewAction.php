<?php

namespace NWNSoftware\Maplibre\Actions;

use Filament\Actions\ViewAction as BaseViewAction;
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
            fn (MapLibreWidget $livewire) => $livewire->getInfolistSchema()
        );

        $this->cancelParentActions();
    }
}
