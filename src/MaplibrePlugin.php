<?php

namespace NWNSoftware\Maplibre;

use Filament\Contracts\Plugin;
use Filament\Panel;

class MaplibrePlugin implements Plugin
{
    public ?string $style = null;

    public ?string $locale = null;

    public array $center = [];

    public int $zoom = 5;

    public ?string $container = null;

    public function getId(): string
    {
        return 'maplibre';
    }

    public function register(Panel $panel): void
    {
        //
    }

    public function boot(Panel $panel): void
    {
        //
    }

    public static function make(): static
    {
        return app(static::class);
    }

    public static function get(): static
    {
        /** @var static $plugin */
        $plugin = filament(app(static::class)->getId());

        return $plugin;
    }

    public function zoom(int $zoom): static
    {
        $this->zoom = $zoom;

        return $this;
    }

    public function getZoom(): int
    {
        return $this->zoom;
    }

    public function center(array $center): static
    {
        $this->center = $center;

        return $this;
    }

    public function getCenter(): array
    {
        return $this->center;
    }

    public function style(string $style): static
    {
        $this->style = $style;

        return $this;
    }

    public function getStyle(): ?string
    {
        return $this->style;
    }

    public function locale(string $locale): static
    {
        $this->locale = $locale;

        return $this;
    }

    public function getLocale(): ?string
    {
        return $this->locale;
    }
}
