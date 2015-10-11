package dal

type Location struct {
	Id       *int    `json:"id,string"`
	Name     *string `json:"name"`
	ImageUrl *string `json:"image"`
}

type locationDto struct {
	id       *int
	name     *string
	imageUrl *string
}

func newLocationDto() *locationDto {
	return &locationDto{
		id:       new(int),
		name:     new(string),
		imageUrl: new(string),
	}
}

func (l *locationDto) ToLocation() *Location {
	return &Location{
		Id:       l.id,
		Name:     l.name,
		ImageUrl: l.imageUrl,
	}
}
