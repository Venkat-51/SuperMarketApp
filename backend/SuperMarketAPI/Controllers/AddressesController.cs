using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperMarketAPI.Data;
using SuperMarketAPI.DTOs;
using SuperMarketAPI.Models;

namespace SuperMarketAPI.Controllers;

[ApiController]
[Route("api/addresses")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly AppDbContext _db;
    public AddressesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAddresses()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var addresses = await _db.Addresses.Where(a => a.UserId == userId.Value).ToListAsync();
        return Ok(addresses.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> AddAddress([FromBody] CreateAddressRequest req)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        // If setting as default, unset all others
        if (req.IsDefault)
        {
            var others = await _db.Addresses.Where(a => a.UserId == userId.Value && a.IsDefault).ToListAsync();
            others.ForEach(a => a.IsDefault = false);
        }

        var address = new Address
        {
            UserId    = userId.Value,
            Label     = req.Label,
            Line1     = req.Line1,
            City      = req.City,
            State     = req.State,
            Pincode   = req.Pincode,
            IsDefault = req.IsDefault,
        };
        _db.Addresses.Add(address);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAddresses), ToDto(address));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        var userId  = GetUserId();
        var address = await _db.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (address is null) return NotFound();
        _db.Addresses.Remove(address);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static AddressDto ToDto(Address a) =>
        new(a.Id, a.Label, a.Line1, a.City, a.State, a.Pincode, a.IsDefault);

    private int? GetUserId()
    {
        var c = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        return c is not null && int.TryParse(c.Value, out var id) ? id : null;
    }
}
