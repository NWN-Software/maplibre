<?php

namespace NWNSoftware\Maplibre\Widgets;

use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Widgets\Widget;

class MapLibreWidget extends Widget implements HasActions, HasForms
{
    use InteractsWithActions;
    use InteractsWithForms;

    protected static string $view = 'maplibre::maplibre';

    protected int | string | array $columnSpan = 'full';

    protected function headerActions(): array
    {
        return [
        ];
    }

    protected function modalActions(): array
    {
        return [
        ];
    }

    public function fetchEvents(array $info): array
    {
        return [];
    }

    public function getFormSchema(): array
    {
        return [];
    }
}
