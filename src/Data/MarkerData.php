<?php

namespace NWNSoftware\Maplibre\Data;

use Illuminate\Contracts\Support\Arrayable;

class MarkerData implements Arrayable
{
    protected int | string $id;

    protected ?string $color = null;

    protected float $latitude = 0;

    protected float $longitude = 0;

    protected array $extraProperties = [];

    protected bool $draggable = false;

    protected ?string $url = null;

    protected ?string $popupText = null;

    protected bool $shouldOpenUrlInNewTab = false;

    protected ?string $avatarUrl = null;

    protected int $avatarIconSize = 40;

    public static function make(): static
    {
        return new static();
    }

    /**
     * A unique identifier of an event.
     */
    public function id(int | string $id): static
    {
        $this->id = $id;

        return $this;
    }

    /**
     * The color of the marker.
     */
    public function color(string $color): static
    {
        $this->color = $color;

        return $this;
    }

    /**
     * The latitude of the marker.
     */
    public function latitude(float $latitude): static
    {
        $this->latitude = $latitude;

        return $this;
    }

    /**
     * The longitude of the marker.
     */
    public function longitude(float $longitude): static
    {
        $this->longitude = $longitude;

        return $this;
    }

    /**
     * Make the marker draggable.
     */
    public function draggable(bool $draggable = true): static
    {
        $this->draggable = $draggable;

        return $this;
    }

    /**
     * Add extra properties that doesn't have a fluent method defined here, to the event.
     */
    public function extraProperties(array $extraProperties): static
    {
        $this->extraProperties = $extraProperties;

        return $this;
    }

    /**
     * A URL that will be visited when this event is clicked by the user.
     */
    public function url(string $url, bool $shouldOpenUrlInNewTab = false): static
    {
        $this->url = $url;
        $this->shouldOpenUrlInNewTab = $shouldOpenUrlInNewTab;

        return $this;
    }

    /**
     * Open the URL in a new tab.
     */
    public function shouldOpenUrlInNewTab(bool $shouldOpenUrlInNewTab = true): static
    {
        $this->shouldOpenUrlInNewTab = $shouldOpenUrlInNewTab;

        return $this;
    }

    /**
     * The text of the popup that will be shown when the marker is clicked.
     */
    public function popupText(string $popupText): static
    {
        $this->popupText = $popupText;

        return $this;
    }

    /**
     * The URL of the avatar that will be shown on the marker.
     */
    public function avatarUrl(?string $avatarUrl): static
    {
        $this->avatarUrl = $avatarUrl;

        return $this;
    }

    /**
     * The size of the avatar icon.
     */
    public function avatarIconSize(int $avatarIconSize): static
    {
        $this->avatarIconSize = $avatarIconSize;

        return $this;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'coordinates' => [$this->longitude, $this->latitude],
            'draggable' => $this->draggable,
            ...$this->color ? ['color' => $this->color] : [],
            ...$this->url ? ['url' => $this->url, 'shouldOpenUrlInNewTab' => $this->shouldOpenUrlInNewTab] : [],
            ...$this->popupText ? ['popupText' => $this->popupText] : [],
            ...$this->avatarUrl ? ['avatarUrl' => $this->avatarUrl, 'avatarIconSize' => $this->avatarIconSize] : [],
            ...$this->extraProperties,
        ];
    }
}
