<?php

namespace NWNSoftware\Maplibre\Widgets;

use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Widgets\Widget;

class MapLibreWidget extends Widget implements HasActions, HasForms
{
    use Concerns\InteractsWithMarkers;
    use Concerns\InteractsWithRecords;
    use InteractsWithActions;
    use InteractsWithForms;

    protected static string $view = 'maplibre::maplibre';

    protected int | string | array $columnSpan = 'full';

    protected array $center = [0, 0];

    protected int $zoom = 5;

    protected bool $allowFullscreen = true;

    public function getMarkers(): array
    {
        return [];
    }

    public function getAvatars(): array
    {
        return [];
    }

    protected function getCenter(): array
    {
        return $this->center;
    }

    protected function getZoom(): int
    {
        return $this->zoom;
    }

    protected function getAllowFullscreen(): bool
    {
        return $this->allowFullscreen;
    }
}
